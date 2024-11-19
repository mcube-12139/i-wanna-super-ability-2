import { SpriteFrame } from "cc";
import { IEditResource } from "./IEditResource";

export class EditResourceMetadata {
    sprite?: SpriteFrame;
    deserializeFun: (data: any) => IEditResource;

    constructor(sprite: SpriteFrame | undefined, deserializeFun: (data: any) => IEditResource) {
        this.sprite = sprite;
        this.deserializeFun = deserializeFun;
    }
}