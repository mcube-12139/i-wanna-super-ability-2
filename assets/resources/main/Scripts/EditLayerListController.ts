import { _decorator, Component, instantiate, Node, resources } from 'cc';
import { EditLayerItemController } from './EditLayerItemController';
import { EditSceneController } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('EditLayerListController')
export class EditLayerListController extends Component {
    @property(Node)
    contentNode: Node;

    start() {
        for (const layerData of EditSceneController.layers) {
            const item = instantiate(resources.get("main/Prefab/EditLayerItem"));
            this.contentNode.addChild(item);

            const controller = item.getComponent(EditLayerItemController);
            const selected = layerData === EditSceneController.nowLayerData;
            controller.setData(layerData);
        }
    }
}


