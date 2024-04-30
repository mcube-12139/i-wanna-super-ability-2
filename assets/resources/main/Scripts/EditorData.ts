import { sys } from "cc";
import { PrefabData } from "./PrefabData";
import { MainMenuOptionId } from "./MainMenuOptionController";
import { SweetDate } from "./SweetDate";
import { EditorAction, EditorActionCreateObject, EditorActionObjectData, EditorActionDeleteObject } from "./EditorAction";
import { LoopArray } from "./LoopArray";

class NodeData {
    id: string;
    prefabName: string;
    x: number;
    y: number;

    constructor(id: string, prefabName: string, x: number, y: number) {
        this.id = id;
        this.prefabName = prefabName;
        this.x = x;
        this.y = y;
    }
}

class LayerData {
    name: string;
    visible: boolean;
    locked: boolean;
    objects: NodeData[];
    objectMap: Map<string, number>;

    constructor(name: string, visible: boolean, locked: boolean, objects: NodeData[]) {
        this.name = name;
        this.visible = visible;
        this.locked = locked;
        this.objects = objects;

        this.objectMap = new Map<string, number>();
        for (const [i, object] of objects.entries()) {
            this.objectMap.set(object.id, i);
        }
    }

    static newEmpty(name: string) {
        return new LayerData(name, true, false, []);
    }

    getObject(id: string) {
        return this.objects[this.objectMap.get(id)];
    }

    addObject(object: NodeData) {
        this.objects.push(object);
        this.objectMap.set(object.id, this.objects.length - 1);
    }

    deleteObject(id: string) {
        const index = this.objectMap.get(id);
        // 重新对齐数组位置
        for (let i = index + 1, count = this.objects.length; i !== count; ++i) {
            const object = this.objects[i];
            this.objectMap.set(object.id, i - 1);
        }
        this.objects.splice(index, 1);
        this.objectMap.delete(id);
    }

    deleteObjects(ids: string[]) {
        const deleted = new Array<boolean>(this.objects.length);
        deleted.fill(false);
        for (const id of ids) {
            deleted[this.objectMap.get(id)] = true;
            this.objectMap.delete(id);
        }

        let offset = 0;
        for (let i = 0, count = this.objects.length; i !== count; ++i) {
            const object = this.objects[i];

            if (!deleted[i]) {
                if (offset !== 0) {
                    this.objects[i - offset] = object;
                    this.objectMap.set(object.id, i - offset);
                }
            } else {
                ++offset;
            }
        }
        this.objects.length -= ids.length;
    }
}

class NodeFile {
    id: string;
    prefabName: string;
    x: number;
    y: number;

    constructor(id: string, prefabName: string, x: number, y: number) {
        this.id = id;
        this.prefabName = prefabName;
        this.x = x;
        this.y = y;
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

export class EditorData {
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
    static mainMenuOptionIndex: MainMenuOptionId;

    static roomMetadataList: RoomMetadata[];
    static nowRoomMetadata: RoomMetadata;
    static nowRoomWidth: number;
    static nowRoomHeight: number;
    static nowRoomBackColor: string;

    static nextObjectId: number;

    static actions = new LoopArray<EditorAction>(64);
    static actionIndex = this.actions.createPointer();
    static createdObjects: EditorActionObjectData[];
    static deletedObjects: EditorActionObjectData[];

    static init() {
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

        this.nextObjectId = 0;

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
            const prefabData = this.prefabDataMap.get(object.prefabName);
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

    static getNewObjectId() {
        return `object${this.nextObjectId++}`;
    }

    static startCreateObject() {
        this.createdObjects = [];
    }

    static endCreateObject() {
        this.actions.next.assign(this.actionIndex);
        this.actions.write(new EditorActionCreateObject(this.nowLayerData.name, this.createdObjects));
        this.actionIndex.assign(this.actions.next);
    }

    static createObject(x: number, y: number) {
        const newId = this.getNewObjectId();
        const nodeData = new NodeData(newId, this.nowPrefabData.name, x, y);
        this.nowLayerData.addObject(nodeData);

        // 保存操作
        this.createdObjects.push(new EditorActionObjectData(x, y, this.nowPrefabData.name, newId));

        return newId;
    }

    /**
     * 获取指定位置的物体
     * @param x 
     * @param y 
     * @returns 物体 id, 不存在则是 ""
     */
    static getObjectAt(x: number, y: number) {
        for (const object of this.nowLayerData.objects) {
            const prefabData = this.prefabDataMap.get(object.prefabName);
            const sourceX = object.x + prefabData.x;
            const sourceY = object.y + prefabData.y;
            const sourceRight = sourceX + prefabData.width;
            const sourceBottom = sourceY + prefabData.height;
            if (x >= sourceX && x < sourceRight && y >= sourceY && y < sourceBottom) {
                return object.id;
            }
        }

        return "";
    }

    static startDeleteObject() {
        this.deletedObjects = [];
    }

    static endDeleteObject() {
        this.actions.next.assign(this.actionIndex);
        this.actions.write(new EditorActionDeleteObject(this.nowLayerData.name, this.deletedObjects));
        this.actionIndex.assign(this.actions.next);
    }

    static deleteObject(id: string) {
        const object = this.nowLayerData.getObject(id);
        this.deletedObjects.push(new EditorActionObjectData(object.x, object.y, object.prefabName, id));

        this.nowLayerData.deleteObject(id);
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

    static undoCreateObject(action: EditorActionCreateObject) {
        this.layerMap.get(action.layer).deleteObjects(action.created.map(v => v.id));
    }

    static undoDeleteObject(action: EditorActionDeleteObject) {
        const layer = this.layerMap.get(action.layer);
        for (const object of action.deleted) {
            layer.addObject(new NodeData(object.id, object.prefab, object.x, object.y));
        }
    }

    static redo() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.next) === -1) {
            const action = this.actionIndex.get();
            action.redo();
            this.actionIndex.increase();
        }
    }

    static redoCreateObject(action: EditorActionCreateObject) {
        const layer = this.layerMap.get(action.layer);
        for (const object of action.created) {
            layer.addObject(new NodeData(object.id, object.prefab, object.x, object.y));
        }
    }

    static redoDeleteObject(action: EditorActionDeleteObject) {
        this.layerMap.get(action.layer).deleteObjects(action.deleted.map(v => v.id));
    }

    static loadRoom(name: string) {
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
        this.nextObjectId = roomFile.nextObjectId;

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
                layerData.addObject(new NodeData(this.getNewObjectId(), nodeFile.prefabName, nodeFile.x, nodeFile.y));
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
                object => new NodeFile(this.getNewObjectId(), object.prefabName, object.x, object.y)
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
}