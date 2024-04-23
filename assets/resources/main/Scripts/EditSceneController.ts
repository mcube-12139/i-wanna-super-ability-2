import { _decorator, Component, Node } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { GridController } from './GridController';
import { ObjectShadowController } from './ObjectShadowController';
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

        gridController.redraw();

        this.selectPrefab(EditorData.nowPrefabIndex);

        if (EditorData.nowRoomIndex === -1) {
            this.toggleWindow("SelectRoomWindow");
        } else {
            EditorData.loadRoom(EditorData.nowRoomIndex);
        }
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


