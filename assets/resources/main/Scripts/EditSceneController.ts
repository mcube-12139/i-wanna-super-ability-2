import { _decorator, Component, find, Node } from 'cc';
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

    gridController: GridController;
    objectShadowController: ObjectShadowController;

    nowWindow: Node | null = null;

    static instance: EditSceneController;

    start() {
        EditSceneController.instance = this;
        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowController);
        this.gridController = this.gridNode.getComponent(GridController);

        this.gridController.redraw();

        this.selectPrefab(EditorData.nowPrefabIndex);

        if (EditorData.nowRoomIndex === -1) {
            this.toggleWindow("SelectRoomWindow");
        } else {
            // 打开过，只需要重新创建
            EditorData.rebuildRoom();
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
        this.nowWindow.destroy();
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

    setGridSize(x: number, y: number) {
        EditorData.setGridSize(x, y);
        this.gridController.redraw();
    }

    setGridVisible(visible: boolean) {
        EditorData.gridVisible = visible;
        this.gridController.redraw();
    }

    setGridColor(color: string) {
        EditorData.gridColor = color;
        this.gridController.redraw();
    }

    setLayerVisible(name: string, visible: boolean) {
        EditorData.getLayerData(name).visible = visible;
        find(`Canvas/${name}`).active = visible;
    }
}


