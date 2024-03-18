export class PrefabData {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static createDataMap(): Map<string, PrefabData> {
        return new Map([
            ["Block", new PrefabData(0, 0, 32, 32)],
            ["NeedleU", new PrefabData(0, 0, 32, 32)],
        ]);
    }
}