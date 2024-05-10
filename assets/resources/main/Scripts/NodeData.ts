import { Node } from "cc";
import { PrefabData } from "./PrefabData";
import { NodeComponents } from "./NodeComponents";

export class NodeData {
    prefab: PrefabData;
    x: number;
    y: number;
    components: NodeComponents;
    node: Node;

    constructor(prefab: PrefabData, x: number, y: number, components: NodeComponents, node: Node) {
        this.prefab = prefab;
        this.x = x;
        this.y = y;
        this.components = components;
        this.node = node;
    }

    static toFiles(datas: NodeData[]) {
        return datas.map(v => v.toFile());
    }

    toFile() {
        return new NodeFile(this.prefab.name, this.x, this.y, this.components.toFile());
    }
}

export class NodeFile {
    prefabName: string;
    x: number;
    y: number;
    components: any;

    constructor(prefabName: string, x: number, y: number, components: any) {
        this.prefabName = prefabName;
        this.x = x;
        this.y = y;
        this.components = components;
    }
}
