import { Node, Rect, Vec2, Vec3 } from "cc";
import { NodeData } from "./NodeData";

export class EditInstance {
    node: Node;
    data: NodeData;
    parent?: EditInstance;
    children: EditInstance[];

    constructor(node: Node, data: NodeData, parent: EditInstance | undefined, children: EditInstance[]) {
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

        return new EditInstance(node, data, undefined, children);
    }

    recover() {
        this.node = new Node();
        for (const component of this.data.components) {
            component.addToNode(this.node);
        }
        this.children.forEach(child => child.recover());
    }

    addChild(instance: EditInstance) {
        this.node.addChild(instance.node);
        this.data.addChild(instance.data);
        instance.parent = this;
        this.children.push(instance);
    }

    destroy() {
        this.node.destroy();
        if (this.parent !== undefined) {
            this.parent.children.splice(this.parent.children.indexOf(this), 1);
            this.parent = undefined;
        }
    }

    getPosition(): Vec3 | undefined {
        const transform = this.data.getTransform();
        if (transform !== undefined) {
            return transform.getPosition();
        }

        return undefined;
    }

    setPosition(position: Vec3): void {
        const transform = this.data.getTransform();
        if (transform !== undefined) {
            transform.position.setValue(position);
            this.node.setPosition(position);
        }
    }
    
    getInstanceAt(position: Vec2): EditInstance | undefined {
        for (const child of this.children) {
            const checkedChild = child.getInstanceAt(position);
            if (checkedChild != undefined) {
                return checkedChild;
            }
        }

        const rect = this.data.getLocalRect();
        if (
            rect !== undefined &&
            position.x >= rect.xMin &&
            position.x < rect.xMax &&
            position.y >= rect.yMin &&
            position.y < rect.yMax
        ) {
            return this;
        }

        return undefined;
    }

    /**
     * 获取与指定区域碰撞的子节点或 undefined
     * @param x 
     * @param y 
     * @returns 
     */
    getChildInterRect(rect: Rect): EditInstance | undefined {
        for (const instance of this.children) {
            const localRect = instance.data.getLocalRect();
            if (localRect !== undefined) {
                if (
                    rect.xMax > localRect.xMin && 
                    rect.xMin < localRect.xMax && 
                    rect.yMax > localRect.yMin && 
                    rect.yMin < localRect.yMax
                ) {
                    // 与待创建区域重叠
                    return instance;
                }
            }
        }

        return undefined;
    }

    getChildrenInterGlobalRect(rect: Rect): EditInstance[] {
        const result: EditInstance[] = [];

        for (const instance of this.children) {
            result.push(...instance.getChildrenInterGlobalRect(rect));

            const globalRect = instance.data.getGlobalRect();
            if (
                globalRect !== undefined &&
                rect.xMax > globalRect.xMin && 
                rect.xMin < globalRect.xMax &&
                rect.yMax > globalRect.yMin && 
                rect.yMin < globalRect.yMax
            ) {
                // 与待创建区域重叠
                result.push(instance);
            }
        }

        return result;
    }
}