import { Node, instantiate, resources } from "cc";
import { ComponentInstance } from "./ComponentInstance";
import { ComponentTemplate } from "./ComponentTemplate";

export class NodeComponents {
    modified: boolean;
    orderModified: boolean;
    data: ComponentInstance[];

    constructor(modified: boolean, orderModified: boolean, data: ComponentInstance[]) {
        this.modified = modified;
        this.orderModified = orderModified;
        this.data = data;
    }

    static fromTemplates(templates: ComponentTemplate[]) {
        return new NodeComponents(false, false, templates.map(template => template.newInstance()));
    }

    static fromFile(file: any, templates: ComponentTemplate[]) {
        if (!file.modified) {
            return this.fromTemplates(templates);
        }
        return new NodeComponents(true, file.orderModified, ComponentInstance.fromFiles(file, templates));
    }

    static createEditInterface(lists: NodeComponents[]): Node {
        const container = instantiate(resources.get("main/Prefab/SweetLayoutVer"));
        
        // 按照组件类型分组
        const map = new Map<string, {
            instances: ComponentInstance[],
            lists: NodeComponents[]
        }>();
        for (const components of lists) {
            for (const instance of components.data) {
                const metaName = instance.meta.type;
                if (!map.has(metaName)) {
                    map.set(metaName, {
                        instances: [instance],
                        lists: [components]
                    });
                } else {
                    const tuple = map.get(metaName);
                    tuple.instances.push(instance);
                    tuple.lists.push(components);
                }
            }
        }

        // 创建各个组件
        for (const { instances, lists } of map.values()) {
            container.addChild(ComponentInstance.createInterface(instances, lists));
        }

        return container;
    }

    addToNode(node: Node): void {
        for (const instance of this.data) {
            instance.addToNode(node);
        }
    }

    toFile(): any {
        if (!this.modified) {
            return {
                modified: false
            };
        }
        if (!this.orderModified) {
            return {
                modified: true,
                orderModified: false,
                data: this.data.filter(v => v.modified).map(v => v.toFile())
            };
        }
        return {
            modified: true,
            orderModified: true,
            data: this.data.map(v => v.toFile())
        };
    }
}