import { Color, Vec2 } from "cc";
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
}