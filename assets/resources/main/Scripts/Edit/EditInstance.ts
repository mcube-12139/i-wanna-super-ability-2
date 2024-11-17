import { Node, Rect, Vec2, Vec3 } from "cc";
import { NodeData } from "./NodeData";

export class EditInstance {
    node: Node;
    data: NodeData;
    parent: EditInstance | null;
    children: EditInstance[];

    constructor(node: Node, data: NodeData, parent: EditInstance | null, children: EditInstance[]) {
        this.node = node;
        this.data = data;
        this.parent = parent;
        this.children = children;
    }

    static fromNodeData(data: NodeData): EditInstance {
        const node = new Node();
        for (const component of data.components) {
            component.addToNode(node);
        }
        const children = data.children.map(child => EditInstance.fromNodeData(child));

        return new EditInstance(node, data, null, children);
    }

    addChild(instance: EditInstance) {
        this.node.addChild(instance.node);
        this.data.addChild(instance.data);
        instance.parent = this;
        this.children.push(instance);
    }

    destroy() {
        this.node.destroy();
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
        this.parent = null;
    }

    getPosition(): Vec3 | null {
        const transform = this.data.getTransform();
        if (transform !== null) {
            return transform.position.clone();
        }

        return null;
    }

    setPosition(position: Vec3): void {
        this.data.getTransform().position.set(position);
        this.node.setPosition(position);
    }
    
    getInstanceAt(position: Vec2): EditInstance | null {
        for (const object of this.children) {
            const got = object.getInstanceAt(position);
            if (got != null) {
                return got;
            }
        }

        const rect = this.data.getLocalRect();
        if (
            position.x >= rect.xMin &&
            position.x <= rect.xMax &&
            position.y >= rect.yMin &&
            position.y <= rect.yMax
        ) {
            return this;
        }

        return null;
    }

    /**
     * 获取与指定区域碰撞的子节点或 null
     * @param x 
     * @param y 
     * @returns 
     */
    getChildInterRect(rect: Rect): EditInstance | null {
        for (const instance of this.children) {
            const localRect = instance.data.getLocalRect();
            if (localRect !== null) {
                if (
                    rect.xMax >= localRect.xMin && 
                    rect.xMin <= localRect.xMax && 
                    rect.yMax >= localRect.yMin && 
                    rect.yMin <= localRect.yMax
                ) {
                    // 与待创建区域重叠
                    return instance;
                }
            }
        }

        return null;
    }

    getChildrenInterGlobalRect(rect: Rect): EditInstance[] {
        const result: EditInstance[] = [];

        for (const instance of this.children) {
            result.push(...instance.getChildrenInterGlobalRect(rect));

            const globalRect = instance.data.getGlobalRect();
            if (
                rect.xMax >= globalRect.xMin && 
                rect.xMin <= globalRect.xMax &&
                rect.yMax >= globalRect.yMin && 
                rect.yMin <= globalRect.yMax
            ) {
                // 与待创建区域重叠
                result.push(instance);
            }
        }

        return result;
    }
}