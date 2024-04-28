import { find, Node, sys, UITransform } from "cc";
import { PrefabData } from "./PrefabData";
import { SweetGlobal } from "./SweetGlobal";
import { EditorExampleController } from "./EditorExampleController";
import { MainMenuOptionId } from "./MainMenuOptionController";
import { SweetDate } from "./SweetDate";

class NodeData {
    prefabName: string;
    x: number;
    y: number;
    node: Node;

    constructor(prefabName: string, x: number, y: number, node: Node) {
        this.prefabName = prefabName;
        this.x = x;
        this.y = y;
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
}

class NodeFile {
    prefabName: string;
    x: number;
    y: number;

    constructor(prefabName: string, x: number, y: number) {
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

    constructor(width: number, height: number, backColor: string, layers: LayerFile[]) {
        this.width = width;
        this.height = height;
        this.backColor = backColor;
        this.layers = layers;
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
    static nowRoomIndex: number;
    static nowRoomMetadata: RoomMetadata;
    static nowRoomWidth: number;
    static nowRoomHeight: number;
    static nowRoomBackColor: string;

    static init() {
        // 读取房间
        const roomListItem = sys.localStorage.getItem("editorRoomMetadatas")
        if (roomListItem !== null) {
            this.roomMetadataList = JSON.parse(roomListItem);
        } else {
            this.roomMetadataList = [];
        }
        this.nowRoomIndex = -1;
        this.nowRoomMetadata = null;
        this.nowRoomWidth = 800;
        this.nowRoomHeight = 450;
        this.nowRoomBackColor = "#7F7F7F";

        this.gridWidth = 32;
        this.gridHeight = 32;
        this.gridColor = "#0000007f";
        this.gridVisible = true;

        this.layers = [
            LayerData.newEmpty("NeedleLayer"),
            LayerData.newEmpty("BlockLayer"),
            LayerData.newEmpty("FruitLayer"),
            LayerData.newEmpty("PlayerLayer")
        ];
        this.layerMap = new Map([
            ["NeedleLayer", this.layers[0]],
            ["BlockLayer", this.layers[1]],
            ["FruitLayer", this.layers[2]],
            ["PlayerLayer", this.layers[3]],
        ]);
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

    static selectPrefab(index: number) {
        this.nowPrefabIndex = index;
        this.nowPrefabData = this.prefabData[index];
        this.selectLayer(this.nowPrefabData.defaultLayer);
    }

    static *validNodes(): Generator<[number, Node], any, unknown> {
        for (const [i, nodeData] of EditorData.nowLayerData.objects.entries()) {
            const node = nodeData.node;
            if (node.isValid) {
                yield [i, node];
            } else {
                nodeData.node = null;
            }
        }
    }

    static addObject(x: number, y: number) {
        const targetX = x + this.nowPrefabData.x;
        const targetY = y + this.nowPrefabData.y;
        const targetRight = x + this.nowPrefabData.x + this.nowPrefabData.width;
        const targetBottom = y + this.nowPrefabData.y + this.nowPrefabData.height;
        // 检查该区域是否存在节点
        let nodeExist = false;
        for (const [i, node] of this.validNodes()) {
            const box = node.getComponent(UITransform).getBoundingBox();
            if (targetRight > box.x && targetX < box.x + box.width && targetBottom > box.y && targetY < box.y + box.height) {
                // 与待创建区域重叠
                nodeExist = true;
                break;
            }
        }
        if (!nodeExist) {
            const node = SweetGlobal.createOnLayerByPrefab("EditorExample", this.nowLayerData.name);
            const control = node.getComponent(EditorExampleController);
            control.setSprite(this.nowPrefabData.sprite);
            
            node.setPosition(x, y);
            if (this.nowPrefabData.x !== 0 || this.nowPrefabData.y !== 0) {
                // 原点不在 0, 0，变换
                const nodeControl = node.getComponent(UITransform);
                nodeControl.setAnchorPoint(-this.nowPrefabData.x / this.nowPrefabData.width, -this.nowPrefabData.y / this.nowPrefabData.height);
            }

            this.nowLayerData.objects.push(new NodeData(this.nowPrefabData.name, x, y, node));
        }
    }

    static deleteObject(x: number, y: number) {
        // 获取该位置的节点
        for (const [i, node] of this.validNodes()) {
            const box = node.getComponent(UITransform).getBoundingBox();
            if (x >= box.x && x < box.x + box.width && y >= box.y && y < box.y + box.height) {
                // 摧毁点在范围内
                this.nowLayerData.objects.splice(i, 1);
                node.destroy();
                break;
            }
        }
    }

    static loadRoom(index: number) {
        this.nowRoomIndex = index;
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

        // 摧毁现有节点
        for (const layer of this.layers) {
            for (const nodeData of layer.objects) {
                nodeData.node.destroy();
            }
        }
        this.layers.length = 0;
        this.layerMap.clear();
        // 创建节点
        for (const layerFile of roomFile.layers) {
            const objects = [];
            const layerData = new LayerData(layerFile.name, true, false, objects);
            this.layers.push(layerData);
            this.layerMap.set(layerFile.name, layerData);
            
            for (const nodeFile of layerFile.objects) {
                const prefabData = this.prefabDataMap.get(nodeFile.prefabName);

                const node = SweetGlobal.createOnLayerByPrefab("EditorExample", layerFile.name);
                const control = node.getComponent(EditorExampleController);
                control.setSprite(prefabData.sprite);
                
                node.setPosition(nodeFile.x, nodeFile.y);
                if (prefabData.x !== 0 || prefabData.y !== 0) {
                    // 原点不在 0, 0，变换
                    const nodeControl = node.getComponent(UITransform);
                    nodeControl.setAnchorPoint(-prefabData.x / prefabData.width, -prefabData.y / prefabData.height);
                }

                objects.push(new NodeData(nodeFile.prefabName, nodeFile.x, nodeFile.y, node));
            }
        }
        this.nowLayerData = this.layers[0];
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
        ]);

        sys.localStorage.setItem("editorRoomMetadatas", JSON.stringify(this.roomMetadataList));
        sys.localStorage.setItem(`editorRoom${name}`, JSON.stringify(room));

        this.loadRoom(this.roomMetadataList.length - 1);

        return {
            ok: true
        };
    }

    static saveRoom() {
        this.nowRoomMetadata.editTime = SweetDate.now();
        sys.localStorage.setItem("editorRoomMetadatas", JSON.stringify(this.roomMetadataList));

        const roomFile = new RoomFile(this.nowRoomWidth, this.nowRoomHeight, this.nowRoomBackColor, this.layers.map(
            layer => new LayerFile(layer.name, layer.objects.map(
                object => new NodeFile(object.prefabName, object.x, object.y)
            ))
        ));
        sys.localStorage.setItem(`editorRoom${this.nowRoomMetadata.name}`, JSON.stringify(roomFile));
    }

    static rebuildRoom() {
        // 创建节点
        for (const layerData of this.layers) {
            for (const nodeData of layerData.objects) {
                const prefabData = this.prefabDataMap.get(nodeData.prefabName);

                const node = SweetGlobal.createOnLayerByPrefab("EditorExample", layerData.name);
                const control = node.getComponent(EditorExampleController);
                control.setSprite(prefabData.sprite);
                
                node.setPosition(nodeData.x, nodeData.y);
                if (prefabData.x !== 0 || prefabData.y !== 0) {
                    // 原点不在 0, 0，变换
                    const nodeControl = node.getComponent(UITransform);
                    nodeControl.setAnchorPoint(-prefabData.x / prefabData.width, -prefabData.y / prefabData.height);
                }

                nodeData.node = node;
            }
        }
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