import { Vec2File } from "../Vec2File";
import { NodeFile } from "./NodeFile";

export class RoomFile {
    id: string;
    name: string;
    root: NodeFile;
    size: Vec2File;
    color: string;

    constructor(id: string, name: string, root: NodeFile, size: Vec2File, color: string) {
        this.id = id;
        this.name = name;
        this.root = root;
        this.size = size;
        this.color = color;
    }
}