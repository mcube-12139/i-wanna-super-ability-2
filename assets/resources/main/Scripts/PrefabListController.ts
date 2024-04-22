import { _decorator, Component, instantiate, Node, resources } from 'cc';
import { EditSceneController } from './EditSceneController';
import { PrefabItemController } from './PrefabItemController';
import { EditorData } from './EditorData';
const { ccclass, property } = _decorator;

@ccclass('PrefabListController')
export class PrefabListController extends Component {
    start() {
        for (const [i, data] of EditorData.prefabData.entries()) {
            const prefabNode = instantiate(resources.get("main/Prefab/ObjectItem"));
            this.node.addChild(prefabNode);
            const controller = prefabNode.getComponent(PrefabItemController);
            controller.setData(i, data);
        }
    }
}


