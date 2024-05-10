import { Node } from "cc";
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