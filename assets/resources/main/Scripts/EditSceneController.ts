import { _decorator, Camera, Component, math, Node, UITransform } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { GridController } from './GridController';
import { ObjectShadowController } from './ObjectShadowController';
import { MainMenuOptionId } from './MainMenuOptionController';
import { EditorData } from './EditorData';
import { EditorExampleController } from './EditorExampleController';
import { EditorActionCreateObject, EditorActionDeleteObject } from './EditorAction';
import { PrefabData } from './PrefabData';
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

    nodeMap: Map<string, Node>;

    static instance: EditSceneController;

    start() {
        EditSceneController.instance = this;
        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowController);
        this.gridController = this.gridNode.getComponent(GridController);

        this.gridController.redraw();

        this.selectPrefab(EditorData.nowPrefabIndex);

        this.nodeMap = new Map<string, Node>();

        if (EditorData.nowRoomMetadata === null) {
            this.toggleWindow("SelectRoomWindow");
        } else {
            // 打开过，只需要重新创建
            this.rebuildRoom();
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
        this.node.getChildByName(name).active = visible;
    }

    setBackColor(color: string) {
        this.node.getChildByName("Camera").getComponent(Camera).clearColor = new math.Color(color);
        EditorData.nowRoomBackColor = color;
    }

    createLayer(before: string, name: string) {
        const node = new Node(name);
        node.setPosition(-400, -225);

        let indexBefore: number;
        if (before !== "") {
            indexBefore = this.node.children.findIndex(v => v.name === before);
        } else {
            indexBefore = this.node.children.findIndex(v => v.name === "Stage");
        }
        this.node.insertChild(node, indexBefore);
        EditorData.createLayer(before, name);
    }

    renameLayer(oldName: string, newName: string) {
        const result = EditorData.renameLayer(oldName, newName);
        if (result.ok) {
            this.node.getChildByName(oldName).name = newName;
        } else {
            return result;
        }
        return {
            ok: true
        };
    }

    deleteLayer(name: string) {
        this.node.getChildByName(name).destroy();
        EditorData.deleteLayer(name);
    }

    moveUpLayer(name: string) {
        const node = this.node.getChildByName(name);
        const index = this.node.children.indexOf(node);

        this.node.removeChild(node);
        this.node.insertChild(node, index - 1);

        EditorData.moveUpLayer(name);
    }

    moveDownLayer(name: string) {
        const node = this.node.getChildByName(name);
        const index = this.node.children.indexOf(node);

        this.node.removeChild(node);
        this.node.insertChild(node, index + 1);

        EditorData.moveDownLayer(name);
    }

    addNode(id: string, layer: string, prefabData: PrefabData, x: number, y: number) {
        const node = SweetGlobal.createOnLayerByPrefab("EditorExample", layer);
        const control = node.getComponent(EditorExampleController);
        control.exampleId = id;
        control.setSprite(prefabData.sprite);
        
        node.setPosition(x, y);
        if (prefabData.x !== 0 || prefabData.y !== 0) {
            // 原点不在 0, 0，变换
            const transform = node.getComponent(UITransform);
            transform.setAnchorPoint(-prefabData.x / prefabData.width, -prefabData.y / prefabData.height);
        }

        this.nodeMap.set(id, node);
    }

    removeNode(id: string) {
        this.nodeMap.get(id).destroy();
        this.nodeMap.delete(id);
    }

    createObject(x: number, y: number) {
        const nodeExist = EditorData.isShadowCollide(x, y);
        if (!nodeExist) {
            const id = EditorData.createObject(x, y);

            this.addNode(id, EditorData.nowLayerData.name, EditorData.nowPrefabData, x, y);
        }
    }

    deleteObject(x: number, y: number) {
        const id = EditorData.getObjectAt(x, y);
        if (id !== "") {
            EditorData.deleteObject(id);
            this.nodeMap.get(id).destroy();
            this.nodeMap.delete(id);
        }
    }

    selectObject(id: string) {
        
    }

    undoCreateObject(action: EditorActionCreateObject) {
        for (const object of action.created) {
            this.removeNode(object.id);
        }
    }

    undoDeleteObject(action: EditorActionDeleteObject) {
        for (const object of action.deleted) {
            this.addNode(object.id, action.layer, EditorData.prefabDataMap.get(object.prefab), object.x, object.y);
        }
    }

    redoCreateObject(action: EditorActionCreateObject) {
        for (const object of action.created) {
            this.addNode(object.id, action.layer, EditorData.prefabDataMap.get(object.prefab), object.x, object.y);
        }
    }

    redoDeleteObject(action: EditorActionDeleteObject) {
        for (const object of action.deleted) {
            this.removeNode(object.id);
        }
    }

    loadRoom(name: string) {
        // 摧毁现有层
        for (const layer of EditorData.layers) {
            this.node.getChildByName(layer.name).destroy();
        }

        EditorData.loadRoom(name);

        this.nodeMap.clear();
        this.rebuildRoom();
    }

    rebuildRoom() {
        this.node.getChildByName("Camera").getComponent(Camera).clearColor = new math.Color(EditorData.nowRoomBackColor);

        // 重新创建层
        for (const layerData of EditorData.layers) {
            const layerNode = new Node(layerData.name);
            layerNode.setPosition(-400, -225);

            let indexBefore = this.node.children.findIndex(v => v.name === "Stage");
            this.node.insertChild(layerNode, indexBefore);

            // 创建节点
            for (const nodeData of layerData.objects) {
                const prefabData = EditorData.prefabDataMap.get(nodeData.prefabName);

                this.addNode(nodeData.id, layerData.name, prefabData, nodeData.x, nodeData.y);
            }
        }
    }
}


