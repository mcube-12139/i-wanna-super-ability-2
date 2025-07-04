import { Color, sys, Vec2 } from "cc";
import { NodeData } from "./NodeData";
import { RoomFile } from "./RoomFile";
import { Vec2File } from "../Vec2File";

export class RoomData {
    id: string;
    name: string;

    root: NodeData;
    size: Vec2;
    color: Color;

    constructor(
        id: string,
        name: string,
        root: NodeData,
        size: Vec2,
        color: Color
    ) {
        this.id = id;
        this.name = name;
        this.root = root;
        this.size = size;
        this.color = color;
    }

    static deserialize(data: RoomFile): RoomData {
        const color = new Color();
        return new RoomData(
            data.id,
            data.name,
            NodeData.deserialize(data.root),
            new Vec2(data.size.x, data.size.y),
            Color.fromHEX(color, data.color)
        );
    }

    static load(id: string): RoomData {
        const str = sys.localStorage.getItem(`edit:room:${id}`);
        return this.deserialize(JSON.parse(str));
    }

    serialize(): RoomFile {
        return new RoomFile(
            this.id,
            this.name,
            this.root.serialize(),
            new Vec2File(this.size),
            this.color.toHEX()
        );
    }

    save() {
        sys.localStorage.setItem(`edit:room:${this.id}`, JSON.stringify(this.serialize()));
    }
}