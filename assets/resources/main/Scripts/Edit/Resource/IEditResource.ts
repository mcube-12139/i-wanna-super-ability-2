import { SpriteFrame } from "cc";
import { EditResourceType } from "./EditResourceType";
import { IEditPage } from "../Page/IEditPage";

export interface IEditResource {
    id: string;
    type: EditResourceType;
    name: string;
    parent?: IEditResource;
    previous?: IEditResource;
    next?: IEditResource;
    firstChild?: IEditResource;
    lastChild?: IEditResource;
    icon?: SpriteFrame;

    createEditPage(): IEditPage;
}