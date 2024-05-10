import { SpriteFrame, resources } from "cc";
import { ComponentTemplate, MovementTemplate, PlatformControllerTemplate } from "./ComponentTemplate";

export class PrefabData {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    sprite: SpriteFrame;
    defaultLayer: string;
    components: ComponentTemplate[];

    constructor(name: string, x: number, y: number, width: number, height: number, spriteName: string, defaultLayer: string, components: ComponentTemplate[]) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprite = resources.get(`main/Sprites/${spriteName}/spriteFrame`);
        this.defaultLayer = defaultLayer;
        this.components = components;
    }

    static createData(): PrefabData[] {
        return [
            new PrefabData("NeedleU", 0, 0, 32, 32, "needle u", "NeedleLayer", []),
            new PrefabData("NeedleD", 0, 0, 32, 32, "needle d", "NeedleLayer", []),
            new PrefabData("NeedleL", 0, 0, 32, 32, "needle l", "NeedleLayer", []),
            new PrefabData("NeedleR", 0, 0, 32, 32, "needle r", "NeedleLayer", []),
            new PrefabData("MiniU", 0, 0, 16, 16, "mini u", "NeedleLayer", []),
            new PrefabData("MiniD", 0, 0, 16, 16, "mini d", "NeedleLayer", []),
            new PrefabData("MiniL", 0, 0, 16, 16, "mini l", "NeedleLayer", []),
            new PrefabData("MiniR", 0, 0, 16, 16, "mini r", "NeedleLayer", []),
            new PrefabData("Block", 0, 0, 32, 32, "block", "BlockLayer", []),
            new PrefabData("MiniBlock", 0, 0, 16, 16, "mini block", "BlockLayer", []),
            new PrefabData("Platform", 0, 0, 32, 16, "platform", "BlockLayer", [
                new PlatformControllerTemplate("0", true),
                new MovementTemplate("1", 0, 0)
            ]),
            new PrefabData("Fruit", -10, -12, 21, 24, "fruit 0", "FruitLayer", []),
            new PrefabData("PlayerStart", 0, 0, 32, 32, "player start", "PlayerLayer", []),
        ];
    }
}