import { SpriteFrame } from "cc";

export class EditSprite {
    id: string;
    name: string;
    sprite: SpriteFrame;

    constructor(id: string, name: string, sprite: SpriteFrame) {
        this.id = id;
        this.name = name;
        this.sprite = sprite;
    }
}