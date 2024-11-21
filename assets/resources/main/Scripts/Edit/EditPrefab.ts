import { Color, Rect, resources, SpriteFrame, Vec2, Vec3 } from "cc";
import { NodeData } from "./NodeData";
import { LinkedValue } from "./LinkedValue";
import { TransformData } from "./ComponentData/TransformData";
import { SpriteData } from "./ComponentData/SpriteData";
import { LinkedArray } from "./LinkedArray";
import { IComponentData } from "./ComponentData/IComponentData";

export class EditPrefab {
    id: string;
    name: string;
    data: NodeData;
    origin: Vec2;

    constructor(
        id: string,
        name: string,
        data: NodeData,
        origin: Vec2
    ) {
        this.id = id;
        this.name = name;
        this.data = data;
        this.origin = origin;
    }

    static createData(): EditPrefab[] {
        return [
            new EditPrefab(
                "grmh0qaj7rylfcmlw3qck8mok1efgd3b",
                "NeedleU",
                new NodeData(
                    "wc2oxetf52dvuo3anyudtu8ic14mlz6w",
                    undefined,
                    undefined,
                    new LinkedValue<string>(true, "NeedleU"),
                    new LinkedValue<boolean>(true, true),
                    new LinkedValue(true, new Rect(-16, -16, 32, 32)),
                    LinkedArray.createUnlinked<IComponentData>([
                        new TransformData(
                            "solheu50fec5wrdarwje1zo56azm1ru9",
                            undefined,
                            new LinkedValue(true, new Vec3(0, 0, 0)),
                            new LinkedValue(true, new Vec3(0, 0, 0)),
                            new LinkedValue(true, new Vec3(1, 1, 1))
                        ),
                        new SpriteData(
                            "u263duyqzrcwgjrasikjy1i0rb8slopv",
                            undefined,
                            new LinkedValue(true, "main/Sprites/needle u"),
                            new LinkedValue(true, Color.WHITE.clone())
                        )
                    ]),
                    undefined,
                    LinkedArray.createUnlinked<NodeData>([])
                ),
                new Vec2(16, 16)
            ),
            new EditPrefab(
                "2ykye086y5pmc7f23k94m7wcgpxwre6a",
                "NeedleD",
                new NodeData(
                    "1tltkz729c9ahwf2dhllzsd94p5j5zsv",
                    undefined,
                    undefined,
                    new LinkedValue<string>(true, "NeedleD"),
                    new LinkedValue<boolean>(true, true),
                    new LinkedValue(true, new Rect(-16, -16, 32, 32)),
                    LinkedArray.createUnlinked<IComponentData>([
                        new TransformData(
                            "atc6kn3i9c1htt4r2fn6mxkzvxlj2kwr",
                            undefined,
                            new LinkedValue(true, new Vec3(0, 0, 0)),
                            new LinkedValue(true, new Vec3(0, 0, 0)),
                            new LinkedValue(true, new Vec3(1, 1, 1))
                        ),
                        new SpriteData(
                            "2c28csromzl4t6zkovmrcmklmzu16iln",
                            undefined,
                            new LinkedValue(true, "main/Sprites/needle d"),
                            new LinkedValue(true, Color.WHITE.clone())
                        )
                    ]),
                    undefined,
                    LinkedArray.createUnlinked<NodeData>([])
                ),
                new Vec2(16, 16)
            ),
            /*
            new EditPrefab("NeedleL", 0, 0, 32, 32, "needle l", "NeedleLayer", []),
            new EditPrefab("NeedleR", 0, 0, 32, 32, "needle r", "NeedleLayer", []),
            new EditPrefab("MiniU", 0, 0, 16, 16, "mini u", "NeedleLayer", []),
            new EditPrefab("MiniD", 0, 0, 16, 16, "mini d", "NeedleLayer", []),
            new EditPrefab("MiniL", 0, 0, 16, 16, "mini l", "NeedleLayer", []),
            new EditPrefab("MiniR", 0, 0, 16, 16, "mini r", "NeedleLayer", []),
            new EditPrefab("Block", 0, 0, 32, 32, "block", "BlockLayer", []),
            new EditPrefab("MiniBlock", 0, 0, 16, 16, "mini block", "BlockLayer", []),
            new EditPrefab("Platform", 0, 0, 32, 16, "platform", "BlockLayer", [
                new PlatformControllerTemplate("0", true),
                new MovementTemplate("1", 0, 0)
            ]),
            new EditPrefab("Fruit", -10, -12, 21, 24, "fruit 0", "FruitLayer", []),
            new EditPrefab("PlayerStart", 0, 0, 32, 32, "player start", "PlayerLayer", []),
            */
        ];
    }

    get sprite(): SpriteFrame {
        const path = this.data.getSprite()?.getPath() ?? "main/Sprites/unknown";
        return resources.get(`${path}/spriteFrame`, SpriteFrame)!;
    }

    createLinked(): NodeData {
        const linked = this.data.createLinked();
        linked.editPrefab = this;
        return linked;
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,

        }
    }
}