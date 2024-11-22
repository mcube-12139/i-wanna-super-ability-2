import { Color, Node, resources, Sprite, SpriteFrame } from "cc";
import { IComponentData } from "./IComponentData";
import { ComponentType } from "./ComponentType";
import { LinkedValue } from "../LinkedValue";
import { SweetUid } from "../../SweetUid";
import { EditData } from "../EditData";
import { SpriteDataFile } from "./SpriteFile";
import { EditSprite } from "../EditSprite";

export class SpriteData implements IComponentData {
    id: string;
    prefab?: SpriteData;

    frame: LinkedValue<EditSprite>;
    color: LinkedValue<Color>;

    constructor(id: string, prefab: SpriteData | undefined, frame: LinkedValue<EditSprite>, color: LinkedValue<Color>) {
        this.id = id;
        this.prefab = prefab;
        this.frame = frame;
        this.color = color;
    }

    static deserialize(data: SpriteDataFile): SpriteData {
        return new SpriteData(
            data.id,
            EditData.instance.getComponentPrefab(data.prefab ?? undefined) as (SpriteData | undefined),
            LinkedValue.deserializeSpecial(data.frame, (value: string) => EditData.instance.getSprite(value)),
            LinkedValue.deserializeSpecial(data.color, (value: string) => new Color().fromHEX(value))
        );
    }

    getFrame(): EditSprite {
        if (this.prefab !== undefined) {
            return this.frame.getValue(this.prefab.getFrame());
        }

        return this.frame.value!;
    }

    getColor(): Color {
        if (this.prefab !== undefined) {
            return this.color.getValue(this.prefab.getColor());
        }

        return this.color.value!;
    }

    createLinked(): IComponentData {
        return new SpriteData(
            SweetUid.create(),
            this,
            LinkedValue.createLinked(),
            LinkedValue.createLinked(),
        );
    }

    addToNode(node: Node): void {
        const sprite = node.addComponent(Sprite);
        sprite.spriteFrame = this.getFrame().sprite;
        sprite.color = new Color(this.getColor());
    }

    serialize() {
        return new SpriteDataFile(
            this.id,
            this.prefab?.id ?? null,
            this.frame.serializeSpecial(value => value.id),
            this.color.serializeSpecial(value => value.toHEX())
        );
    }
    
    getType(): ComponentType {
        return ComponentType.SPRITE;
    }
}