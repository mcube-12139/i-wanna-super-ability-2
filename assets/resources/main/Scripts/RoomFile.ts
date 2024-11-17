import { LayerFile } from "./LayerData";

export class RoomDataSummary {
    id: string;
    name: string;
    editTime: string;

    constructor(id: string, name: string, editTime: string) {
        this.id = id;
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

