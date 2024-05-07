import { _decorator, Camera, Component, instantiate, math, Node, resources, sys, UITransform } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { GridController } from './GridController';
import { ObjectShadowController } from './ObjectShadowController';
import { MainMenuOptionId } from './MainMenuOptionController';
import { EditorExampleController } from './EditorExampleController';
import { EditorAction, EditorActionCreate, EditorActionDelete, EditorActionDrag, EditorActionSelect } from './EditorAction';
import { PrefabData } from './PrefabData';
import { SelectorController } from './SelectorController';
import { ComponentTemplate, ComponentTemplateFile } from './ComponentTemplate';
import { LoopArray, LoopArrayPointer } from './LoopArray';
import { SweetDate } from './SweetDate';
const { ccclass, property } = _decorator;

export class NodeData {
    prefab: PrefabData;
    x: number;
    y: number;
    components: ComponentTemplate[];
    node: Node;

    constructor(prefab: PrefabData, x: number, y: number, components: ComponentTemplate[], node: Node) {
        this.prefab = prefab;
        this.x = x;
        this.y = y;
        this.components = components;
        this.node = node;
    }
}

class LayerData {
    name: string;
    visible: boolean;
    locked: boolean;
    objects: NodeData[];

    constructor(name: string, visible: boolean, locked: boolean, objects: NodeData[]) {
        this.name = name;
        this.visible = visible;
        this.locked = locked;
        this.objects = objects;
    }

    static newEmpty(name: string) {
        return new LayerData(name, true, false, []);
    }

    addObject(object: NodeData) {
        this.objects.push(object);
    }

    deleteObject(object: NodeData) {
        const index = this.objects.indexOf(object);
        this.objects.splice(index, 1);
    }

    tryDeleteObject(object: NodeData) {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            object.node.destroy();
            this.objects.splice(index, 1);
        }
    }

    deleteObjects(objects: NodeData[]) {
        const set = new Set<NodeData>(objects);

        let offset = 0;
        for (let i = 0, count = this.objects.length; i !== count; ++i) {
            const object = this.objects[i];

            if (set.has(object)) {
                if (offset !== 0) {
                    this.objects[i - offset] = object;
                }
            } else {
                ++offset;
            }
        }
        this.objects.length -= objects.length;
    }
}

class NodeFile {
    prefabName: string;
    x: number;
    y: number;
    components: ComponentTemplateFile[];

    constructor(prefabName: string, x: number, y: number, components: ComponentTemplateFile[]) {
        this.prefabName = prefabName;
        this.x = x;
        this.y = y;
        this.components = components;
    }
}

class LayerFile {
    name: string;
    objects: NodeFile[];

    constructor(name: string, objects: NodeFile[]) {
        this.name = name;
        this.objects = objects;
    }

    static newEmpty(name: string) {
        return new LayerFile(name, []);
    }
}

class RoomMetadata {
    name: string;
    editTime: string;

    constructor(name: string, editTime: string) {
        this.name = name;
        this.editTime = editTime;
    }
}

class RoomFile {
    width: number;
    height: number;
    backColor: string;
    layers: LayerFile[];
    nextObjectId: number;

    constructor(width: number, height: number, backColor: string, layers: LayerFile[], nextObjectId: number) {
        this.width = width;
        this.height = height;
        this.backColor = backColor;
        this.layers = layers;
        this.nextObjectId = nextObjectId;
    }
}

@ccclass('EditSceneController')
export class EditSceneController extends Component {
    @property(Node)
    windowLayer: Node;
    @property(Node)
    gridNode: Node;
    @property(Node)
    stage: Node;
    @property(Node)
    objectShadow: Node;

    gridController: GridController;
    objectShadowController: ObjectShadowController;

    selectorMap = new Map<NodeData, Node>();

    nowWindow: Node | null = null;

    static gridWidth: number;
    static gridHeight: number;
    static gridColor: string;
    static gridVisible: boolean;
    
    static layers: LayerData[];
    static layerMap: Map<string, LayerData>;
    static nowLayerData: LayerData;
    
    static prefabData: PrefabData[];
    static prefabDataMap: Map<string, PrefabData>;
    static nowPrefabIndex: number;
    static nowPrefabData: PrefabData;
    static mainMenuOptionId: MainMenuOptionId;

    static roomMetadataList: RoomMetadata[];
    static nowRoomMetadata: RoomMetadata;
    static nowRoomWidth: number;
    static nowRoomHeight: number;
    static nowRoomBackColor: string;

    static selectedObjects: NodeData[];

    static actions = new LoopArray<EditorAction>(64);
    static actionIndex: LoopArrayPointer<EditorAction>;

    static createdObjects: NodeData[];
    static deletedObjects: NodeData[];
    static dragStartX: number;
    static dragStartY: number;
    static dragDiffX: number;
    static dragDiffY: number;

    static instance: EditSceneController;

    static initData() {
        // 读取房间
        const roomListItem = sys.localStorage.getItem("editorRoomMetadatas")
        if (roomListItem !== null) {
            this.roomMetadataList = JSON.parse(roomListItem);
        } else {
            this.roomMetadataList = [];
        }
        this.nowRoomMetadata = null;
        this.nowRoomWidth = 800;
        this.nowRoomHeight = 450;
        this.nowRoomBackColor = "#7F7F7F";

        this.selectedObjects = [];

        this.actionIndex = this.actions.createPointer();

        this.gridWidth = 32;
        this.gridHeight = 32;
        this.gridColor = "#0000007f";
        this.gridVisible = true;

        this.layers = [];
        this.layerMap = new Map<string, LayerData>();
        this.nowLayerData = this.layers[0];

        this.nowPrefabIndex = 0;
        this.prefabData = PrefabData.createData();
        this.prefabDataMap = new Map<string, PrefabData>();
        for (const [_, data] of this.prefabData.entries()) {
            this.prefabDataMap.set(data.name, data);
        }
    }

    static selectLayer(name: string) {
        this.nowLayerData = this.layerMap.get(name);
    }

    static getLayerData(name: string) {
        return this.layerMap.get(name);
    }

    static getNewLayerName() {
        let i: number;
        for (i = 0; this.layerMap.has(`newLayer${i}`); ++i) {
        }
        return `newLayer${i}`;
    }

    static createLayer(before: string, name: string) {
        const data = LayerData.newEmpty(name);

        let index: number;
        if (before !== "") {
            index = this.layers.findIndex(v => v.name === name);
        } else {
            index = this.layers.length;
        }
        this.layers.splice(index, 0, data);
        this.layerMap.set(name, data);
    }

    static renameLayer(oldName: string, newName: string) {
        if (this.layerMap.has(newName)) {
            return {
                ok: false,
                error: "层名重复"
            };
        }

        const data = this.layerMap.get(oldName);
        data.name = newName;
        this.layerMap.delete(oldName);
        this.layerMap.set(newName, data);
        return {
            ok: true
        };
    }

    static deleteLayer(name: string) {
        this.layers.splice(this.layers.findIndex(v => v.name === name), 1);
        this.layerMap.delete(name);
    }

    static moveUpLayer(name: string) {
        const index = this.layers.findIndex(v => v.name === name);
        if (index !== -1) {
            const previous = this.layers[index - 1];
            this.layers[index - 1] = this.layers[index];
            this.layers[index] = previous;
        }
    }

    static moveDownLayer(name: string) {
        const index = this.layers.findIndex(v => v.name === name);
        if (index !== -1) {
            const next = this.layers[index + 1];
            this.layers[index + 1] = this.layers[index];
            this.layers[index] = next;
        }
    }

    static selectPrefab(index: number) {
        this.nowPrefabIndex = index;
        this.nowPrefabData = this.prefabData[index];
        this.selectLayer(this.nowPrefabData.defaultLayer);
    }

    /**
     * 检测目标物体在该位置是否碰撞
     * @param x 
     * @param y 
     * @returns 结果
     */
    static isShadowCollide(x: number, y: number) {
        const targetX = x + this.nowPrefabData.x;
        const targetY = y + this.nowPrefabData.y;
        const targetRight = x + this.nowPrefabData.x + this.nowPrefabData.width;
        const targetBottom = y + this.nowPrefabData.y + this.nowPrefabData.height;

        for (const object of this.nowLayerData.objects) {
            const prefabData = object.prefab;
            const sourceX = object.x + prefabData.x;
            const sourceY = object.y + prefabData.y;
            const sourceRight = sourceX + prefabData.width;
            const sourceBottom = sourceY + prefabData.height;
            if (targetRight > sourceX && targetX < sourceRight && targetBottom > sourceY && targetY < sourceBottom) {
                // 与待创建区域重叠
                return true;
            }
        }

        return false;
    }

    static addAction(action: EditorAction) {
        this.actions.next.assign(this.actionIndex);
        this.actions.write(action);
        this.actionIndex.assign(this.actions.next);
    }

    static startCreateObject() {
        this.createdObjects = [];
    }

    static createObject(x: number, y: number, node: Node) {
        const components = this.nowPrefabData.components.map(v => new ComponentTemplate(v.name, v.data.clone()));
        const nodeData = new NodeData(this.nowPrefabData, x, y, components, node);
        this.nowLayerData.addObject(nodeData);

        // 保存操作
        this.createdObjects.push(nodeData);
    }

    static endCreateObject() {
        this.addAction(new EditorActionCreate(this.nowLayerData.name, this.createdObjects));
    }

    /**
     * 获取指定位置的物体
     * @param x 
     * @param y 
     * @returns 物体, 不存在则是 null
     */
    static getObjectAt(x: number, y: number) {
        for (const object of this.nowLayerData.objects) {
            const prefabData = object.prefab;
            const sourceX = object.x + prefabData.x;
            const sourceY = object.y + prefabData.y;
            const sourceRight = sourceX + prefabData.width;
            const sourceBottom = sourceY + prefabData.height;
            if (x >= sourceX && x < sourceRight && y >= sourceY && y < sourceBottom) {
                return object;
            }
        }

        return null;
    }

    static startDeleteObject() {
        this.deletedObjects = [];
    }

    static deleteObject(object: NodeData) {
        this.deletedObjects.push(object);

        // 从被选中物体中删除
        const selectIndex = this.selectedObjects.indexOf(object);
        if (selectIndex !== -1) {
            this.selectedObjects.splice(selectIndex, 1);
        }
        // 从层物体表中删除
        for (const layer of this.layers) {
            layer.tryDeleteObject(object);
        }
    }

    static endDeleteObject() {
        if (this.deletedObjects.length !== 0) {
            this.addAction(new EditorActionDelete(this.nowLayerData.name, this.deletedObjects));
        }
    }

    static selectObjects(objects: NodeData[]) {
        const action = new EditorActionSelect(this.selectedObjects, objects);
        this.addAction(action);
        this.selectedObjects = objects;
    }

    static startDrag(x: number, y: number) {
        this.dragStartX = this.selectedObjects[0].x;
        this.dragStartY = this.selectedObjects[0].y;
        this.dragDiffX = x - this.dragStartX;
        this.dragDiffY = y - this.dragStartY;
    }

    static dragTo(x: number, y: number) {
        for (const object of this.selectedObjects) {
            object.x = x - this.dragDiffX;
            object.y = y - this.dragDiffY;
        }
    }

    static endDrag() {
        const movementX = this.selectedObjects[0].x - this.dragStartX;
        const movementY = this.selectedObjects[0].y - this.dragStartY;
        if (movementX !== 0 || movementY !== 0) {
            this.addAction(new EditorActionDrag(this.selectedObjects, movementX, movementY));
        }
    }

    static setX(x: number) {
        for (const object of this.selectedObjects) {
            object.x = x;
        }
    }

    static setY(y: number) {
        for (const object of this.selectedObjects) {
            object.y = y;
        }
    }

    static getUndoAction() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.start) === 1) {
            const pointer = this.actions.createPointer();
            pointer.assign(this.actionIndex);
            pointer.decrease();

            return pointer.get();
        }

        return null;
    }

    static getRedoAction() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.next) === -1) {
            return this.actionIndex.get();
        }

        return null;
    }

    static undo() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.start) === 1) {
            this.actionIndex.decrease();
            const action = this.actionIndex.get();
            action.undo();
        }
    }

    static undoCreate(action: EditorActionCreate) {
        this.layerMap.get(action.layer).deleteObjects(action.created);
    }

    static undoDelete(action: EditorActionDelete) {
        const layer = this.layerMap.get(action.layer);
        for (const object of action.deleted) {
            layer.addObject(object);
        }
    }

    static undoSelect(action: EditorActionSelect) {
        this.selectedObjects = action.before;
    }

    static undoDrag(action: EditorActionDrag) {
        for (const object of this.selectedObjects) {
            object.x -= action.movementX;
            object.y -= action.movementY;
        }
    }

    static redo() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.next) === -1) {
            const action = this.actionIndex.get();
            action.redo();
            this.actionIndex.increase();
        }
    }

    static redoCreate(action: EditorActionCreate) {
        const layer = this.layerMap.get(action.layer);
        for (const object of action.created) {
            layer.addObject(object);
        }
    }

    static redoDelete(action: EditorActionDelete) {
        this.layerMap.get(action.layer).deleteObjects(action.deleted);
    }

    static redoSelect(action: EditorActionSelect) {
        this.selectedObjects = action.after;
    }

    static redoDrag(action: EditorActionDrag) {
        for (const object of this.selectedObjects) {
            object.x += action.movementX;
            object.y += action.movementY;
        }
    }

    static loadRoom(name: string) {
        // 摧毁当前节点
        for (const layer of this.layers) {
            for (const object of layer.objects) {
                object.node.destroy();
            }
        }

        const index = this.roomMetadataList.findIndex(v => v.name === name);
        this.nowRoomMetadata = this.roomMetadataList[index];

        const roomFileItem = sys.localStorage.getItem(`editorRoom${this.nowRoomMetadata.name}`);
        let roomFile: RoomFile;
        if (roomFileItem !== null) {
            roomFile = JSON.parse(roomFileItem);
        } else {
            alert(`room not found: ${this.nowRoomMetadata.name}`);
            return;
        }

        this.nowRoomWidth = roomFile.width;
        this.nowRoomWidth = roomFile.height;
        this.nowRoomBackColor = roomFile.backColor;

        // 清空操作记录
        this.actions.clear();
        this.actionIndex.assign(this.actions.start);

        // 读取层
        this.layers.length = 0;
        this.layerMap.clear();
        for (const layerFile of roomFile.layers) {
            const layerData = LayerData.newEmpty(layerFile.name);
            this.layers.push(layerData);
            this.layerMap.set(layerFile.name, layerData);
            
            for (const nodeFile of layerFile.objects) {
                const components = nodeFile.components.map(v => ComponentTemplate.create(v.name, v.data));
                layerData.addObject(new NodeData(this.prefabDataMap.get(nodeFile.prefabName), nodeFile.x, nodeFile.y, components, null));
            }
        }

        // 尝试切换当前层
        if (this.layerMap.has(this.nowPrefabData.defaultLayer)) {
            this.nowLayerData = this.layerMap.get(this.nowPrefabData.defaultLayer);
        } else {
            this.nowLayerData = this.layers[0];
        }
    }

    static hasRoom(name: string) {
        return this.roomMetadataList.findIndex(v => v.name === name) !== -1;
    }

    static createRoom(name: string) {
        // 检查房间名是否重复
        if (this.hasRoom(name)) {
            return {
                ok: false,
                error: "房间名重复"
            };
        }

        const time = SweetDate.now();
        const metadata = new RoomMetadata(name, time);
        this.roomMetadataList.push(metadata);

        const room = new RoomFile(800, 450, "#7F7F7F", [
            LayerFile.newEmpty("NeedleLayer"),
            LayerFile.newEmpty("BlockLayer"),
            LayerFile.newEmpty("FruitLayer"),
            LayerFile.newEmpty("PlayerLayer")
        ], 0);

        sys.localStorage.setItem("editorRoomMetadatas", JSON.stringify(this.roomMetadataList));
        sys.localStorage.setItem(`editorRoom${name}`, JSON.stringify(room));

        this.loadRoom(name);

        return {
            ok: true
        };
    }

    static saveRoom() {
        this.nowRoomMetadata.editTime = SweetDate.now();
        sys.localStorage.setItem("editorRoomMetadatas", JSON.stringify(this.roomMetadataList));

        const roomFile = new RoomFile(this.nowRoomWidth, this.nowRoomHeight, this.nowRoomBackColor, this.layers.map(
            layer => new LayerFile(layer.name, layer.objects.map(
                object => new NodeFile(object.prefab.name, object.x, object.y, object.components)
            ))
        ), 0);
        sys.localStorage.setItem(`editorRoom${this.nowRoomMetadata.name}`, JSON.stringify(roomFile));
    }

    static renameRoom(name: string) {
        // 检查房间名是否重复
        if (this.hasRoom(name)) {
            return {
                ok: false,
                error: "房间名重复"
            };
        }

        this.nowRoomMetadata.name = name;
        return {
            ok: true
        };
    }

    static setGridSize(x: number, y: number) {
        this.gridWidth = x;
        this.gridHeight = y;
    }

    start() {
        EditSceneController.instance = this;
        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowController);
        this.gridController = this.gridNode.getComponent(GridController);

        this.gridController.redraw();

        this.selectPrefab(EditSceneController.nowPrefabIndex);

        if (EditSceneController.nowRoomMetadata === null) {
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
        EditSceneController.selectPrefab(index);
        this.objectShadowController.updateSprite();
    }

    openMainMenuWindow(option: MainMenuOptionId) {
        EditSceneController.mainMenuOptionId = option;
        this.toggleWindow("MainMenuWindow");
    }

    setGridSize(x: number, y: number) {
        EditSceneController.setGridSize(x, y);
        this.gridController.redraw();
    }

    setGridVisible(visible: boolean) {
        EditSceneController.gridVisible = visible;
        this.gridController.redraw();
    }

    setGridColor(color: string) {
        EditSceneController.gridColor = color;
        this.gridController.redraw();
    }

    setLayerVisible(name: string, visible: boolean) {
        EditSceneController.getLayerData(name).visible = visible;
        this.node.getChildByName(name).active = visible;
    }

    setBackColor(color: string) {
        this.node.getChildByName("Camera").getComponent(Camera).clearColor = new math.Color(color);
        EditSceneController.nowRoomBackColor = color;
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
        EditSceneController.createLayer(before, name);
    }

    renameLayer(oldName: string, newName: string) {
        const result = EditSceneController.renameLayer(oldName, newName);
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
        EditSceneController.deleteLayer(name);
    }

    moveUpLayer(name: string) {
        const node = this.node.getChildByName(name);
        const index = this.node.children.indexOf(node);

        this.node.removeChild(node);
        this.node.insertChild(node, index - 1);

        EditSceneController.moveUpLayer(name);
    }

    moveDownLayer(name: string) {
        const node = this.node.getChildByName(name);
        const index = this.node.children.indexOf(node);

        this.node.removeChild(node);
        this.node.insertChild(node, index + 1);

        EditSceneController.moveDownLayer(name);
    }

    addNode(layer: string, prefabData: PrefabData, x: number, y: number): Node {
        const node = SweetGlobal.createOnLayerByPrefab("EditorExample", layer);
        const control = node.getComponent(EditorExampleController);
        control.setSprite(prefabData.sprite);
        
        node.setPosition(x, y);
        if (prefabData.x !== 0 || prefabData.y !== 0) {
            // 原点不在 0, 0，变换
            const transform = node.getComponent(UITransform);
            transform.setAnchorPoint(-prefabData.x / prefabData.width, -prefabData.y / prefabData.height);
        }

        return node;
    }

    removeNode(object: NodeData) {
        object.node.destroy();
    }

    createObject(x: number, y: number) {
        const nodeExist = EditSceneController.isShadowCollide(x, y);
        if (!nodeExist) {
            const node = this.addNode(EditSceneController.nowLayerData.name, EditSceneController.nowPrefabData, x, y);
            EditSceneController.createObject(x, y, node);
        }
    }

    deleteObject(object: NodeData) {
        if (this.selectorMap.has(object)) {
            this.selectorMap.get(object).destroy();
            this.selectorMap.delete(object);
        }

        EditSceneController.deleteObject(object);
    }

    updateSelector(object: NodeData) {
        const node = object.node;
        
        if (this.selectorMap.has(object)) {
            const selector = this.selectorMap.get(object);
            const prefabData = object.prefab;

            selector.setPosition(node.position.x + prefabData.x, node.position.y + prefabData.y);
            const controller = selector.getComponent(SelectorController);
            controller.width = prefabData.width;
            controller.height = prefabData.height;
        }
    }

    setSelectedObjects(objects: NodeData[]) {
        // 摧毁原有的选择框
        for (const selector of this.selectorMap.values()) {
            selector.destroy();
        }
        this.selectorMap.clear();

        for (const object of objects) {
            const selector = instantiate(resources.get("main/Prefab/Selector"));
            this.stage.addChild(selector);
            this.selectorMap.set(object, selector);

            this.updateSelector(object);
        }
    }

    selectObjects(objects: NodeData[]) {
        // 比较数组相等，不等时才执行
        let different = false;
        if (objects.length !== EditSceneController.selectedObjects.length) {
            different = true;
        } else {
            for (let i = 0, count = objects.length; i !== count; ++i) {
                const after = objects[i];
                const before = EditSceneController.selectedObjects[i];
                if (after !== before) {
                    different = true;
                    break;
                }
            }
        }

        if (different) {
            this.setSelectedObjects(objects);
            EditSceneController.selectObjects(objects);
        }
    }

    dragTo(x: number, y: number) {
        for (const object of EditSceneController.selectedObjects) {
            const node = object.node;
            node.setPosition(x - EditSceneController.dragDiffX, y - EditSceneController.dragDiffY);
            this.updateSelector(object);
        }
        EditSceneController.dragTo(x, y);
    }

    setX(x: number) {
        for (const object of EditSceneController.selectedObjects) {
            const node = object.node;
            node.setPosition(x, node.position.y);
            this.updateSelector(object);
        }

        EditSceneController.setX(x);
    }

    setY(y: number) {
        for (const object of EditSceneController.selectedObjects) {
            const node = object.node;
            node.setPosition(node.position.x, y);
            this.updateSelector(object);
        }

        EditSceneController.setY(y);
    }

    undoCreate(action: EditorActionCreate) {
        for (const object of action.created) {
            this.removeNode(object);
        }
        EditSceneController.undoCreate(action);
    }

    undoDelete(action: EditorActionDelete) {
        for (const object of action.deleted) {
            this.addNode(action.layer, object.prefab, object.x, object.y);
        }
        EditSceneController.undoDelete(action);
    }

    undoSelect(action: EditorActionSelect) {
        this.setSelectedObjects(action.before);
        EditSceneController.undoSelect(action);
    }

    undoDrag(action: EditorActionDrag) {
        for (const object of action.objects) {
            const node = object.node;
            node.setPosition(node.position.x - action.movementX, node.position.y - action.movementY);
            this.updateSelector(object);
        }
        EditSceneController.undoDrag(action);
    }

    redoCreate(action: EditorActionCreate) {
        for (const object of action.created) {
            this.addNode(action.layer, object.prefab, object.x, object.y);
        }
        EditSceneController.redoCreate(action);
    }

    redoDelete(action: EditorActionDelete) {
        for (const object of action.deleted) {
            this.removeNode(object);
        }
        EditSceneController.redoDelete(action);
    }

    redoSelect(action: EditorActionSelect) {
        this.setSelectedObjects(action.after);
        EditSceneController.redoSelect(action);
    }

    redoDrag(action: EditorActionDrag) {
        for (const object of action.objects) {
            const node = object.node
            node.setPosition(node.position.x + action.movementX, node.position.y + action.movementY);
            this.updateSelector(object);
        }
        EditSceneController.redoDrag(action);
    }

    loadRoom(name: string) {
        // 摧毁现有层
        for (const layer of EditSceneController.layers) {
            this.node.getChildByName(layer.name).destroy();
        }

        EditSceneController.loadRoom(name);

        this.rebuildRoom();
    }

    rebuildRoom() {
        this.node.getChildByName("Camera").getComponent(Camera).clearColor = new math.Color(EditSceneController.nowRoomBackColor);

        // 重新创建层
        for (const layerData of EditSceneController.layers) {
            const layerNode = new Node(layerData.name);
            layerNode.setPosition(-400, -225);

            let indexBefore = this.node.children.findIndex(v => v.name === "Stage");
            this.node.insertChild(layerNode, indexBefore);

            // 创建节点
            for (const nodeData of layerData.objects) {
                const prefabData = nodeData.prefab;

                const node = this.addNode(layerData.name, prefabData, nodeData.x, nodeData.y);
                nodeData.node = node;
            }
        }
    }
}


