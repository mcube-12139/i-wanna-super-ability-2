import { SpriteFrame } from "cc";
import { EditResourceType } from "./EditResourceType";
import { IEditPage } from "../Page/IEditPage";

export interface IEditResource {
    id: string;
    type: EditResourceType;
    name: string;
    parent?: IEditResource;
    children?: IEditResource[];
    icon?: SpriteFrame;

    createEditPage(): IEditPage;
}