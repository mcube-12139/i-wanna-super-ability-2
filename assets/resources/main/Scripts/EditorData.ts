import { math, Node, UITransform } from "cc";
import { PrefabData } from "./PrefabData";
import { SweetGlobal } from "./SweetGlobal";
import { EditorExampleController } from "./EditorExampleController";
import { MainMenuOptionId } from "./MainMenuOptionController";

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

export class EditorData {
    static gridWidth: number;
    static gridHeight: number;
    static gridColor: math.Color;
    static gridVisible: boolean;
    
    static layers: LayerData[];
    static layerMap: Map<string, LayerData>;
    static nowLayerData: LayerData;
    
    static prefabData: PrefabData[];
    static nowPrefabIndex: number;
    static nowPrefabData: PrefabData;
    static mainMenuOptionIndex: MainMenuOptionId;

    static init() {
        this.gridWidth = 32;
        this.gridHeight = 32;
        this.gridColor = new math.Color(0, 0, 0, 128);
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
        ])
        this.nowLayerData = this.layers[0];

        this.prefabData = PrefabData.createData();
    }

    static selectPrefab(index: number) {
        this.nowPrefabIndex = index;
        this.nowPrefabData = this.prefabData[index];
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
}