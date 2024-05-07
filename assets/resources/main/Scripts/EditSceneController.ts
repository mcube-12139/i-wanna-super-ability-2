import { _decorator, Camera, Component, instantiate, math, Node, resources, sys, UITransform } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { GridController } from './GridController';
import { ObjectShadowController } from './ObjectShadowController';
import { MainMenuOptionId } from './MainMenuOptionController';
import { EditorExampleController } from './EditorExampleController';
import { EditorAction, EditorActionCreate, EditorActionDelete, EditorActionDeletedObject, EditorActionDrag, EditorActionSelect } from './EditorAction';
import { PrefabData } from './PrefabData';
import { SelectorController } from './SelectorController';
import { ComponentTemplate } from './ComponentTemplate';
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

export class LayerData {
    name: string;
    node: Node;
    visible: boolean;
    locked: boolean;
    objects: NodeData[];

    constructor(name: string, node: Node, visible: boolean, locked: boolean, objects: NodeData[]) {
        this.name = name;
        this.node = node;
        this.visible = visible;
        this.locked = locked;
        this.objects = objects;
    }

    static newEmpty(name: string, node: Node) {
        return new LayerData(name, node, true, false, []);
    }

    addObject(object: NodeData) {
        this.objects.push(object);
    }

    tryDeleteObject(object: NodeData) {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            object.node.destroy();
            this.objects.splice(index, 1);
            return true;
        }

        return false;
    }

    deleteObjects(objects: NodeData[]) {
        const set = new Set<NodeData>(objects);

        let offset = 0;
        for (let i = 0, count = this.objects.length; i !== count; ++i) {
            const object = this.objects[i];

            if (!set.has(object)) {
                // 非待删除，前移
                if (offset !== 0) {
                    this.objects[i - offset] = object;
                }
            } else {
                // 是待删除，删掉，前移距离 +1
                object.node.destroy();
                ++offset;
            }
        }
        this.objects.length -= objects.length;
    }

    setVisible(visible: boolean) {
        this.visible = visible;
        this.node.active = visible;
    }
}

class NodeFile {
    prefabName: string;
    x: number;
    y: number;
    components: any[];

    constructor(prefabName: string, x: number, y: number, components: any[]) {
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
    @property(Camera)
    camera: Camera;
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

    static throughLayer: boolean;
    
    static layers: LayerData[];
    static layerMap: Map<string, LayerData>;
    static nowLayerData: LayerData;
    
    static prefabData: PrefabData[];
    static prefabDataMap: Map<string, PrefabData>;
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
    static deletedObjects: EditorActionDeletedObject[];
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

        this.throughLayer = false;

        this.layers = [];
        this.layerMap = new Map<string, LayerData>();
        this.nowLayerData = this.layers[0];

        this.prefabData = PrefabData.createData();
        this.prefabDataMap = new Map<string, PrefabData>();
        for (const [_, data] of this.prefabData.entries()) {
            this.prefabDataMap.set(data.name, data);
        }

        ComponentTemplate.initMetaMap();
    }

    static selectLayer(data: LayerData) {
        this.nowLayerData = data;
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

    static createLayer(before: LayerData) {
        const name = this.getNewLayerName();
        const node = new Node(name);
        node.setPosition(-400, -225);

        let nodeIndex: number;
        if (before !== null) {
            nodeIndex = this.instance.node.children.indexOf(before.node);
        } else {
            nodeIndex = this.instance.node.children.findIndex(v => v.name === "Stage");
        }
        this.instance.node.insertChild(node, nodeIndex);

        const data = LayerData.newEmpty(name, node);

        let index: number;
        if (before !== null) {
            index = this.layers.indexOf(before);
        } else {
            index = this.layers.length;
        }
        this.layers.splice(index, 0, data);
        this.layerMap.set(name, data);

        return data;
    }

    static renameLayer(data: LayerData, newName: string) {
        if (this.layerMap.has(newName)) {
            return {
                ok: false,
                error: "层名重复"
            };
        }

        const oldName = data.name;
        data.name = newName;
        this.layerMap.delete(oldName);
        this.layerMap.set(newName, data);
        return {
            ok: true
        };
    }

    static deleteLayer(data: LayerData) {
        this.layers.splice(this.layers.indexOf(data), 1);
        this.layerMap.delete(data.name);
    }

    static moveUpLayer(data: LayerData) {
        const index = this.layers.indexOf(data);
        if (index !== -1) {
            const previous = this.layers[index - 1];
            this.layers[index - 1] = this.layers[index];
            this.layers[index] = previous;
        }
    }

    static moveDownLayer(data: LayerData) {
        const index = this.layers.indexOf(data);
        if (index !== -1) {
            const next = this.layers[index + 1];
            this.layers[index + 1] = this.layers[index];
            this.layers[index] = next;
        }
    }

    static selectPrefab(prefabData: PrefabData) {
        this.nowPrefabData = prefabData;
        const defaultLayer = this.nowPrefabData.defaultLayer;
        if (this.layerMap.has(defaultLayer)) {
            this.selectLayer(this.layerMap.get(defaultLayer));
        }

        this.instance.objectShadowController.updateSprite();
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

    static createObject(x: number, y: number) {
        if (!this.nowLayerData.locked) {
            const nodeExist = this.isShadowCollide(x, y);
            if (!nodeExist) {
                const node = this.addNode(this.nowLayerData, EditSceneController.nowPrefabData, x, y);

                const components = this.nowPrefabData.components.map(v => v.clone());
                const nodeData = new NodeData(this.nowPrefabData, x, y, components, node);
                this.nowLayerData.addObject(nodeData);
        
                // 保存操作
                this.createdObjects.push(nodeData);
            }
        }
    }

    static endCreateObject() {
        if (this.createdObjects.length !== 0) {
            this.addAction(new EditorActionCreate(this.nowLayerData, this.createdObjects));
        }
    }

    /**
     * 获取可访问的物体。未开启层穿透时，如果当前层未锁定，则返回当前层上所有物体，否则返回空；开启层穿透时，返回所有未锁定层上所有物体
     */
    static *accessibleObjects() {
        if (!this.throughLayer) {
            if (!this.nowLayerData.locked) {
                for (const object of this.nowLayerData.objects) {
                    yield object;
                }
            }
        } else {
            for (const layer of this.layers) {
                if (!layer.locked) {
                    for (const object of layer.objects) {
                        yield object;
                    }
                }
            }
        }
    }

    /**
     * 获取指定位置的物体
     * @param x 
     * @param y 
     * @returns 物体, 不存在则是 null
     */
    static getObjectAt(x: number, y: number) {
        for (const object of this.accessibleObjects()) {
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
        if (this.instance.selectorMap.has(object)) {
            this.instance.selectorMap.get(object).destroy();
            this.instance.selectorMap.delete(object);
        }
        
        // 从被选中物体中删除
        const selectIndex = this.selectedObjects.indexOf(object);
        if (selectIndex !== -1) {
            this.selectedObjects.splice(selectIndex, 1);
        }
        // 从层物体表中删除
        let layer: LayerData;
        for (const l of this.layers) {
            if (l.tryDeleteObject(object)) {
                layer = l;
                break;
            }
        }
        this.deletedObjects.push(new EditorActionDeletedObject(layer, object));
    }

    static endDeleteObject() {
        if (this.deletedObjects.length !== 0) {
            this.addAction(new EditorActionDelete(this.deletedObjects));
        }
    }

    static selectObjects(objects: NodeData[]) {
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
            this.instance.setSelectedObjects(objects);
        
            const action = new EditorActionSelect(this.selectedObjects, objects);
            this.addAction(action);
            this.selectedObjects = objects;
        }
    }

    static startDrag(x: number, y: number) {
        this.dragStartX = this.selectedObjects[0].x;
        this.dragStartY = this.selectedObjects[0].y;
        this.dragDiffX = x - this.dragStartX;
        this.dragDiffY = y - this.dragStartY;
    }

    static dragTo(x: number, y: number) {
        for (const object of this.selectedObjects) {
            const node = object.node;
            node.setPosition(x - this.dragDiffX, y - this.dragDiffY);
            this.instance.updateSelector(object);
            
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
            const node = object.node;
            node.setPosition(x, node.position.y);
            this.instance.updateSelector(object);
                
            object.x = x;
        }
    }

    static setY(y: number) {
        for (const object of this.selectedObjects) {
            const node = object.node;
            node.setPosition(node.position.x, y);
            this.instance.updateSelector(object);
                
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
        action.layer.deleteObjects(action.created);
    }

    static undoDelete(action: EditorActionDelete) {
        for (const deleted of action.deleted) {
            const object = deleted.object;
            object.node = this.addNode(deleted.layer, object.prefab, object.x, object.y);

            deleted.layer.addObject(deleted.object);
        }
    }

    static undoSelect(action: EditorActionSelect) {
        this.instance.setSelectedObjects(action.before);
        this.selectedObjects = action.before;
    }

    static undoDrag(action: EditorActionDrag) {
        for (const object of this.selectedObjects) {
            const node = object.node;
            node.setPosition(node.position.x - action.movementX, node.position.y - action.movementY);
            this.instance.updateSelector(object);

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
        for (const object of action.created) {
            object.node = this.addNode(action.layer, object.prefab, object.x, object.y);

            action.layer.addObject(object);
        }
    }

    static redoDelete(action: EditorActionDelete) {
        for (const deleted of action.deleted) {
            deleted.layer.tryDeleteObject(deleted.object);
        }
    }

    static redoSelect(action: EditorActionSelect) {
        this.instance.setSelectedObjects(action.after);
        this.selectedObjects = action.after;
    }

    static redoDrag(action: EditorActionDrag) {
        for (const object of this.selectedObjects) {
            const node = object.node
            node.setPosition(node.position.x + action.movementX, node.position.y + action.movementY);
            this.instance.updateSelector(object);

            object.x += action.movementX;
            object.y += action.movementY;
        }
    }

    static loadRoom(name: string) {
        // 摧毁当前节点
        for (const layer of this.layers) {
            layer.node.destroy();
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
            const layerData = LayerData.newEmpty(layerFile.name, null);
            this.layers.push(layerData);
            this.layerMap.set(layerFile.name, layerData);
            
            for (const nodeFile of layerFile.objects) {
                const components = nodeFile.components.map(v => ComponentTemplate.create(v));
                // 暂时赋值 null，等后面 rebuildRoom 时再改成相应节点
                layerData.addObject(new NodeData(this.prefabDataMap.get(nodeFile.prefabName), nodeFile.x, nodeFile.y, components, null));
            }
        }

        // 尝试切换当前层
        if (this.layerMap.has(this.nowPrefabData.defaultLayer)) {
            this.nowLayerData = this.layerMap.get(this.nowPrefabData.defaultLayer);
        } else {
            this.nowLayerData = this.layers[0];
        }

        this.instance.rebuildRoom();
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
                object => new NodeFile(object.prefab.name, object.x, object.y, object.components.map(
                    component => component.toFile()
                ))
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
        this.instance.gridController.redraw();
    }

    static setGridColor(color: string) {
        this.gridColor = color;
        this.instance.gridController.redraw();
    }

    static setGridVisible(visible: boolean) {
        this.gridVisible = visible;
        this.instance.gridController.redraw();
    }

    static setBackColor(color: string) {
        this.nowRoomBackColor = color;
        this.instance.camera.clearColor = new math.Color(color);
    }

    static addNode(layer: LayerData, prefabData: PrefabData, x: number, y: number): Node {
        const node = instantiate(resources.get("main/Prefab/EditorExample"));
        layer.node.addChild(node);
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

    start() {
        EditSceneController.instance = this;
        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowController);
        this.gridController = this.gridNode.getComponent(GridController);

        this.gridController.redraw();

        EditSceneController.selectPrefab(EditSceneController.prefabData[0]);

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

    openMainMenuWindow(option: MainMenuOptionId) {
        EditSceneController.mainMenuOptionId = option;
        this.toggleWindow("MainMenuWindow");
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

    /**
     * 设置被选中物体。代码调用，不记录操作。
     */
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

    rebuildRoom() {
        this.camera.clearColor = new math.Color(EditSceneController.nowRoomBackColor);
        this.objectShadowController.updateSprite();
        this.gridController.redraw();

        // 重新创建层
        for (const layerData of EditSceneController.layers) {
            const layerNode = new Node(layerData.name);
            layerData.node = layerNode;
            layerNode.setPosition(-400, -225);

            let indexBefore = this.node.children.findIndex(v => v.name === "Stage");
            this.node.insertChild(layerNode, indexBefore);

            // 创建节点
            for (const nodeData of layerData.objects) {
                const prefabData = nodeData.prefab;

                const node = EditSceneController.addNode(layerData, prefabData, nodeData.x, nodeData.y);
                nodeData.node = node;
            }
        }
    }
}


