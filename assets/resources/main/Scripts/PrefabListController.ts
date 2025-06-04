import { _decorator, Component, instantiate, Node, resources } from 'cc';
import { EditSceneController } from './Edit/Editor';
import { PrefabItemController } from './PrefabItemController';
const { ccclass, property } = _decorator;

@ccclass('PrefabListController')
export class PrefabListController extends Component {
    start() {
        for (const [i, data] of EditSceneController.prefabData.entries()) {
            const prefabNode = instantiate(resources.get("main/Prefab/ObjectItem"));
            this.node.addChild(prefabNode);
            const controller = prefabNode.getComponent(PrefabItemController);
            controller.setData(data);
        }
    }
}


