import { Node } from "cc";

export interface IComponentData {
    id: string;
    clone(): IComponentData;
    addToNode(node: Node): void;
    serialize(): any;
    getType(): ComponentDataType;
}