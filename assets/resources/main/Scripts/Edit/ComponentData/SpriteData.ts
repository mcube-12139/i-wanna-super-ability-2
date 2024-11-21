import { Color, Node, resources, Sprite, SpriteFrame } from "cc";
import { IComponentData } from "./IComponentData";
import { ComponentType } from "./ComponentType";
import { LinkedValue } from "../LinkedValue";
import { SweetUid } from "../../SweetUid";
import { EditData } from "../EditData";
import { SpriteDataFile } from "./SpriteDataFile";

export class SpriteData implements IComponentData {
    id: string;
    prefab?: SpriteData;

    path: LinkedValue<string>;
    color: LinkedValue<Color>;

    constructor(id: string, prefab: SpriteData | undefined, path: LinkedValue<string>, color: LinkedValue<Color>) {
        this.id = id;
        this.prefab = prefab;
        this.path = path;
        this.color = color;
    }

    static deserialize(data: SpriteDataFile): SpriteData {
        return new SpriteData(
            data.id,
            EditData.instance.getComponentPrefab(data.prefab ?? undefined) as (SpriteData | undefined),
            LinkedValue.deserialize(data.path),
            LinkedValue.deserializeSpecial(data.color, (value: string) => new Color().fromHEX(value))
        );
    }

    getPath(): string {
        if (this.prefab !== undefined) {
            return this.path.getValue(this.prefab.getPath());
        }

        return this.path.value!;
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
            new LinkedValue(false, ""),
            new LinkedValue(false, new Color())
        );
    }

    addToNode(node: Node): void {
        const sprite = node.addComponent(Sprite);
        sprite.spriteFrame = resources.get(`${this.getPath()}/spriteFrame`, SpriteFrame);
        sprite.color = new Color(this.getColor());
    }

    serialize() {
        return new SpriteDataFile(
            this.id,
            this.prefab?.id ?? null,
            this.path.serialize(),
            this.color.serializeSpecial(value => value.toHEX())
        );
    }
    
    getType(): ComponentType {
        return ComponentType.SPRITE;
    }
}