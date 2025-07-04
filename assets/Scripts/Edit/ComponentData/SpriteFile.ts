import { LinkedData } from "../../LinkedData";
import { ComponentType } from "./ComponentType";
import { IComponentFile } from "./IComponentFile";

export class SpriteDataFile implements IComponentFile {
    id: string;
    type: ComponentType;
    prefab: string | null;
    frame: LinkedData<string>;
    color: LinkedData<string>;
    
    constructor(id: string, prefab: string | null, frame: LinkedData<string>, color: LinkedData<string>) {
        this.id = id;
        this.type = ComponentType.SPRITE;
        this.prefab = prefab;
        this.frame = frame;
        this.color = color;
    }
}