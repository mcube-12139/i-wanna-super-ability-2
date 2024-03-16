import { _decorator, Component, instantiate, math, Node, Prefab, resources } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { GridController } from './GridController';
import { ObjectShadowController } from './ObjectShadowController';
const { ccclass, property } = _decorator;

export class PrefabData {
    layer: string;

    constructor(layer: string) {
        this.layer = layer;
    }

    static data: Map<string, PrefabData> = new Map([
        ["Block", new PrefabData("BlockLayer")],
        ["NeedleU", new PrefabData("NeedleLayer")],
    ]);
}

@ccclass('EditSceneController')
export class EditSceneController extends Component {
    @property(Node)
    windowLayer: Node;
    @property(Node)
    gridNode: Node;
    @property(Node)
    objectShadow: Node;

    gridWidth: number;
    gridHeight: number;
    gridColor: math.Color;
    gridVisible: boolean;

    nowPrefabName: string;
    nowPrefabData: PrefabData;

    nowWindow: Node | null = null;
    static instance: EditSceneController;

    start() {
        EditSceneController.instance = this;

        const gridController = this.gridNode.getComponent(GridController);
        this.gridWidth = 32;
        this.gridHeight = 32;
        this.gridColor = new math.Color(0, 0, 0, 128);
        this.gridVisible = true;
        gridController.redraw();

        this.nowPrefabName = "Block";
        this.nowPrefabData = PrefabData.data.get(this.nowPrefabName);

        this.toggleWindow("SelectRoomWindow");
    }

    toggleWindow(prefabName: string) {
        if (this.nowWindow !== null) {
            this.closeWindow();
        }
        const window = SweetGlobal.createByPrefab(prefabName);
        this.windowLayer.addChild(window);
        this.nowWindow = window;
        this.objectShadow.getComponent(ObjectShadowController).disable();
    }

    closeWindow() {
        this.windowLayer.removeChild(this.nowWindow);
        this.nowWindow = null;
        this.objectShadow.getComponent(ObjectShadowController).enable();
    }

    onDisable() {
        EditSceneController.instance = null;
    }
}


