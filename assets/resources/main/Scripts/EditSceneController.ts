import { _decorator, Component, EventKeyboard, find, input, Input, instantiate, KeyCode, math, Node, Prefab, resources, UITransform } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { GridController } from './GridController';
import { ObjectShadowController } from './ObjectShadowController';
import { PrefabData } from './PrefabData';
import { EditorExampleController } from './EditorExampleController';
import { MainMenuOptionId } from './MainMenuOptionController';
import { EditorData } from './EditorData';
const { ccclass, property } = _decorator;

@ccclass('EditSceneController')
export class EditSceneController extends Component {
    @property(Node)
    windowLayer: Node;
    @property(Node)
    gridNode: Node;
    @property(Node)
    objectShadow: Node;

    objectShadowController: ObjectShadowController;

    nowWindow: Node | null = null;

    static instance: EditSceneController;

    start() {
        EditSceneController.instance = this;
        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowController);
        const gridController = this.gridNode.getComponent(GridController);

        EditorData.init();
        gridController.redraw();

        this.selectPrefab(0);
        this.toggleWindow("SelectRoomWindow");
    }

    onDisable() {
        EditSceneController.instance = null;
    }

    toggleWindow(prefabName: string) {
        if (this.nowWindow !== null) {
            this.closeWindow();
        }
        const window = SweetGlobal.createByPrefab(prefabName);
        this.windowLayer.addChild(window);
        this.nowWindow = window;
        this.objectShadowController.disable();
    }

    closeWindow() {
        this.windowLayer.removeChild(this.nowWindow);
        this.nowWindow = null;
        this.objectShadowController.enable();
    }

    selectPrefab(index: number) {
        EditorData.selectPrefab(index);
        this.objectShadowController.updateSprite();
    }

    openMainMenuWindow(option: MainMenuOptionId) {
        EditorData.mainMenuOptionIndex = option;
        this.toggleWindow("MainMenuWindow");
    }
}


