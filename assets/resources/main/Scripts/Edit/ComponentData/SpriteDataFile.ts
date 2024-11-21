import { LinkedData } from "../../LinkedData";
import { ComponentType } from "./ComponentType";
import { IComponentDataFile } from "./IComponentDataFile";

export class SpriteDataFile implements IComponentDataFile {
    id: string;
    type: ComponentType;
    prefab: string | null;
    path: LinkedData<string>;
    color: LinkedData<string>;
    
    constructor(id: string, prefab: string | null, path: LinkedData<string>, color: LinkedData<string>) {
        this.id = id;
        this.type = ComponentType.SPRITE;
        this.prefab = prefab;
        this.path = path;
        this.color = color;
    }
}