import { Node } from "cc";
import { ComponentType } from "./ComponentType";
import { ILinkable } from "../../ILinkable";
import { IComponentDataFile } from "./IComponentDataFile";

export type IComponentData = ILinkable<IComponentData> & {
    serialize(): IComponentDataFile;
    addToNode(node: Node): void;
    getType(): ComponentType;
};