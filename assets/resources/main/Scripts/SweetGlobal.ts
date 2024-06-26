import { Prefab, director, instantiate, resources, Node, find, Component } from "cc";
import { Tag, TagId } from "./Tag";

export class SweetGlobal {
    static START_GAME_SCENE_NAME = "game";

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
        return instantiate(resources.get(`main/Prefab/${name}`) as Prefab);
    }

    static createOnLayerByPrefab(prefabName: string, layerName: string): Node {
        const node = instantiate(resources.get(`main/Prefab/${prefabName}`) as Prefab);
        find(`Canvas/${layerName}`).addChild(node);
        return node;
    }

    static reset() {
        this.grav = 1;
    }

    static save() {
        if (Tag.hasNode(TagId.PLAYER)) {
            const player = Tag.getNode(TagId.PLAYER);
            const sceneName = director.getScene().name;

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
        const data = JSON.parse(localStorage.getItem("gameData"));
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