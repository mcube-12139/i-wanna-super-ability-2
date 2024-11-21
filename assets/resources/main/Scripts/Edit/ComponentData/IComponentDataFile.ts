import { ILinkableFile } from "../../ILinkableFile";
import { ComponentType } from "./ComponentType";

export type IComponentDataFile = ILinkableFile & {
    type: ComponentType;
};