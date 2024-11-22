import { Node } from "cc";
import { ComponentType } from "./ComponentType";
import { ILinkable } from "../../ILinkable";
import { IComponentFile } from "./IComponentFile";

export type IComponentData = ILinkable<IComponentFile, IComponentData> & {
    addToNode(node: Node): void;
    getType(): ComponentType;
};