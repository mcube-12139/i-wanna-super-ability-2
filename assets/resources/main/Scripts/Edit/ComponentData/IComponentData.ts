import { Node } from "cc";
import { ComponentType } from "./ComponentType";

export interface IComponentData {
    id: string;
    prefab?: IComponentData;
    createLinked(): IComponentData;
    addToNode(node: Node): void;
    serializeData(): any;
    getType(): ComponentType;
}