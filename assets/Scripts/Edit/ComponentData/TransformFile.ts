import { LinkedData } from "../../LinkedData";
import { Vec3File } from "../../Vec3File";
import { ComponentType } from "./ComponentType";
import { IComponentFile } from "./IComponentFile";

export class TransformDataFile implements IComponentFile {
    id: string;
    prefab: string | null;
    type: ComponentType;
    position: LinkedData<Vec3File>;
    rotation: LinkedData<Vec3File>;
    scale: LinkedData<Vec3File>;

    constructor(id: string, prefab: string | null, position: LinkedData<Vec3File>, rotation: LinkedData<Vec3File>, scale: LinkedData<Vec3File>) {
        this.id = id;
        this.prefab = prefab;
        this.type = ComponentType.TRANSFORM;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}