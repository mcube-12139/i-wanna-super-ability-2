import { LayerFile } from "./LayerData";

export class RoomMetadata {
    name: string;
    editTime: string;

    constructor(name: string, editTime: string) {
        this.name = name;
        this.editTime = editTime;
    }
}

export class RoomFile {
    width: number;
    height: number;
    backColor: string;
    layers: LayerFile[];

    constructor(width: number, height: number, backColor: string, layers: LayerFile[]) {
        this.width = width;
        this.height = height;
        this.backColor = backColor;
        this.layers = layers;
    }
}

