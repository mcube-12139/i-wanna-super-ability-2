import { Node } from "cc";
import { NodeData, NodeFile } from "./Edit/NodeData";

export class LayerData {
    name: string;
    node: Node;
    visible: boolean;
    locked: boolean;
    objects: NodeData[];

    constructor(name: string, node: Node, visible: boolean, locked: boolean, objects: NodeData[]) {
        this.name = name;
        this.node = node;
        this.visible = visible;
        this.locked = locked;
        this.objects = objects;
    }

    static newEmpty(name: string, node: Node) {
        return new LayerData(name, node, true, false, []);
    }

    static toFiles(datas: LayerData[]) {
        return datas.map(data => data.toFile());
    }

    addObject(object: NodeData) {
        this.objects.push(object);
    }

    tryDeleteObject(object: NodeData) {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            object.node.destroy();
            this.objects.splice(index, 1);
            return true;
        }

        return false;
    }

    deleteObjects(objects: NodeData[]) {
        const set = new Set<NodeData>(objects);

        let offset = 0;
        for (let i = 0, count = this.objects.length; i !== count; ++i) {
            const object = this.objects[i];

            if (!set.has(object)) {
                // 非待删除，前移
                if (offset !== 0) {
                    this.objects[i - offset] = object;
                }
            } else {
                // 是待删除，删掉，前移距离 +1
                object.node.destroy();
                ++offset;
            }
        }
        this.objects.length -= objects.length;
    }

    setVisible(visible: boolean) {
        this.visible = visible;
        this.node.active = visible;
    }

    toFile() {
        return new LayerFile(this.name, NodeData.toFiles(this.objects));
    }
}

export class LayerFile {
    name: string;
    objects: NodeFile[];

    constructor(name: string, objects: NodeFile[]) {
        this.name = name;
        this.objects = objects;
    }

    static newEmpty(name: string) {
        return new LayerFile(name, []);
    }
}

