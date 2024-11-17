import { Color, Node, resources, Sprite, SpriteFrame, Vec3 } from "cc";
import { IComponentData } from "./IComponentData";
import { ComponentDataType } from "./ComponentDataType";

export class SpriteData implements IComponentData {
    id: string;
    
    path: string;
    color: Color;

    constructor(id: string, path: string, color: Color) {
        this.id = id;
        this.path = path;
        this.color = color;
    }

    clone(): IComponentData {
        return new SpriteData(this.id, this.path, this.color);
    }

    addToNode(node: Node): void {
        const sprite = node.addComponent(Sprite);
        sprite.spriteFrame = resources.get(this.path, SpriteFrame);
        sprite.color = this.color;
    }

    serialize(): object {
        return {
            id: this.id,
            path: this.path,
            color: this.color.toHEX()
        };
    }
    
    getType(): ComponentDataType {
        return ComponentDataType.SPRITE;
    }
}