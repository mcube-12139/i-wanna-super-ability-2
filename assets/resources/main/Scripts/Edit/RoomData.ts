import { Color, sys, Vec2 } from "cc";
import { NodeData } from "./NodeData";

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

    static deserialize(data: any): RoomData {
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
        const str = sys.localStorage.getItem(`editRoom${id}`);
        return this.deserialize(JSON.parse(str));
    }

    serialize(): object {
        return {
            id: this.id,
            name: this.name,
            root: this.root.serialize(),
            size: {
                x: this.size.x,
                y: this.size.y
            },
            color: this.color.toHEX()
        };
    }

    save() {
        sys.localStorage.setItem(`editRoom${this.id}`, JSON.stringify(this.serialize()));
    }
}