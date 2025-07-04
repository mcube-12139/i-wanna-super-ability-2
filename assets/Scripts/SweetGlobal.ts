import { Prefab, director, instantiate, resources, Node, find, Component, SpriteFrame } from "cc";
import { Tag, TagId } from "./Tag";
import { GameSceneControl } from "./GameSceneControl";

export class SweetGlobal {
    static START_GAME_SCENE_NAME = "game";

    static editWindowPrefab: Prefab;
    static selectorPrefab: Prefab;
    static selectorShadowPrefab: Prefab;
    static sweetInputPrefab: Prefab;
    static resourceItemPrefab: Prefab;
    static editPagePrefab: Prefab;
    static nodeTreePagePrefab: Prefab;
    static nodePagePrefab: Prefab;
    static menuOptionPrefab: Prefab;
    static playerPrefab: Prefab;
    static bulletPrefab: Prefab;

    static unknownSprite: SpriteFrame;
    static needleUSprite: SpriteFrame;
    static needleDSprite: SpriteFrame;
    static expandedSprite: SpriteFrame;
    static collapsedSprite: SpriteFrame;
    static nodeSprite: SpriteFrame;

    static nullableGameScene?: GameSceneControl = undefined;
    static get gameScene() {
        return this.nullableGameScene!;
    }

    static grav = 1;
    static autosave = true;
    static loaded = false;
    static savedData = {
        sceneName: "",
        playerX: 0,
        playerY: 0,
        playerScaleX: 0,
        grav: 1
    };

    static createByPrefab(name: string): Node {
        return instantiate(resources.get(`main/Prefab/${name}`, Prefab)!);
    }

    static reset() {
        this.grav = 1;
    }

    static save() {
        if (Tag.hasNode(TagId.PLAYER)) {
            const player = Tag.getNode(TagId.PLAYER);
            const sceneName = director.getScene()!.name;

            this.savedData.sceneName = sceneName;
            this.savedData.playerX = player.position.x;
            this.savedData.playerY = player.position.y;
            this.savedData.playerScaleX = player.scale.x;
            this.savedData.grav = this.grav;

            //* WEB_DESKTOP
            localStorage.setItem("gameData", JSON.stringify(this.savedData));
            //*/

            /* DOUYIN_MICROGAME
            //*/
        }
    }

    static load() {
        this.loaded = true;

        director.loadScene(this.savedData.sceneName);
    }

    static loadFile() {
        //* WEB_DESKTOP
        const data = JSON.parse(localStorage.getItem("gameData")!);
        this.savedData.sceneName = data.sceneName;
        this.savedData.playerX = data.playerX;
        this.savedData.playerY = data.playerY;
        this.savedData.playerScaleX = data.playerScaleX;
        this.savedData.grav = data.grav;
        //*/

        /* DOUYIN_MICROGAME
        //*/

        this.load();
    }

    static hasData() {
        //* WEB_DESKTOP
        return localStorage.getItem("gameData") !== null;
        //*/

        /* DOUYIN_MICROGAME
        //*/
    }
}