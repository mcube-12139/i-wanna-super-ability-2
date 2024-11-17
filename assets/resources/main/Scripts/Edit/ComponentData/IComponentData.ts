import { Node } from "cc";
import { ComponentDataType } from "./ComponentDataType";

export interface IComponentData {
    id: string;
    clone(): IComponentData;
    addToNode(node: Node): void;
    serialize(): any;
    getType(): ComponentDataType;
}