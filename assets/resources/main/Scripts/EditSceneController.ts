import { _decorator, Component, instantiate, math, Node, Prefab, resources, UITransform } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { GridController } from './GridController';
import { ObjectShadowController } from './ObjectShadowController';
import { PrefabData } from './PrefabData';
const { ccclass, property } = _decorator;

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
    objects: NodeData[];

    constructor(name: string, objects: NodeData[]) {
        this.name = name;
        this.objects = objects;
    }

    static newEmpty(name: string) {
        return new LayerData(name, []);
    }
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

    layers: LayerData[];
    nowLayerData: LayerData;

    prefabData: Map<string, PrefabData>;
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

        this.layers = [
            LayerData.newEmpty("BlockLayer")
        ];
        this.nowLayerData = this.layers[0];

        this.prefabData = PrefabData.createDataMap();
        this.nowPrefabName = "Block";
        this.nowPrefabData = this.prefabData.get(this.nowPrefabName);

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

    *validNodes(): Generator<[number, Node], any, unknown> {
        for (const [i, nodeData] of this.nowLayerData.objects.entries()) {
            const node = nodeData.node;
            if (node.isValid) {
                yield [i, node];
            } else {
                nodeData.node = null;
            }
        }
    }

    addObject(x: number, y: number) {
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
            const node = SweetGlobal.createOnLayerByPrefab(this.nowPrefabName, this.nowLayerData.name);
            node.setPosition(x, y);

            this.nowLayerData.objects.push(new NodeData(this.nowPrefabName, x, y, node));
        }
    }

    deleteObject(x: number, y: number) {
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

    onDisable() {
        EditSceneController.instance = null;
    }
}


