import { ILinkableFile } from "../../ILinkableFile";
import { ComponentType } from "./ComponentType";

export type IComponentFile = ILinkableFile & {
    type: ComponentType;
};