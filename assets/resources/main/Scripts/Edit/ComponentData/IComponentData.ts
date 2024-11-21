import { Node } from "cc";
import { ComponentType } from "./ComponentType";
import { IIdentity } from "../../IIdentity";

export type IComponentData = IIdentity<IComponentData> & {
    addToNode(node: Node): void;
    getType(): ComponentType;
};