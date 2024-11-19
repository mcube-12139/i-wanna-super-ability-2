import { SpriteFrame } from "cc";
import { EditResourceType } from "./EditResourceType";

export interface IEditResource {
    id: string;
    type: EditResourceType;
    name: string;
    parent?: IEditResource;
    children?: IEditResource[];
    icon?: SpriteFrame;
}