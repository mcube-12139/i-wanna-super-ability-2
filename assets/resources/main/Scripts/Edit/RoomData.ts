import { Color, Vec2 } from "cc";
import { EditInstance } from "./EditInstance";

export class RoomData {
    id: string;
    name: string;

    gridSize: Vec2;
    gridColor: Color;
    gridVisible: boolean;
    root: EditInstance;
    roomSize: Vec2;
    roomColor: Color;

    constructor(
        id: string,
        name: string,
        gridSize: Vec2,
        gridColor: Color,
        gridVisible: boolean,
        root: EditInstance,
        roomSize: Vec2,
        roomColor: Color
    ) {
        this.id = id;
        this.name = name;
        this.gridSize = gridSize;
        this.gridColor = gridColor;
        this.gridVisible = gridVisible;
        this.root = root;
        this.roomSize = roomSize;
        this.roomColor = roomColor;
    }

    serialize(): object {
        return {
            id: this.id,
            name: this.name,
            gridSize: {
                x: this.gridSize.x,
                y: this.gridSize.y
            },
            gridColor: this.gridColor.toHEX(),
            gridVisible: this.gridVisible,
            root: this.root.data.serialize(),
            roomSize: {
                x: this.roomSize.x,
                y: this.roomSize.y
            },
            roomColor: this.roomColor.toHEX()
        };
    }
}