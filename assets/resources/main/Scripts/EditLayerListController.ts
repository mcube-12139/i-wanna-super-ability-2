import { _decorator, Component, instantiate, Node, resources } from 'cc';
import { EditorData } from './EditorData';
import { EditLayerItemController } from './EditLayerItemController';
const { ccclass, property } = _decorator;

@ccclass('EditLayerListController')
export class EditLayerListController extends Component {
    @property(Node)
    contentNode: Node;

    start() {
        for (const layerData of EditorData.layers) {
            const item = instantiate(resources.get("main/Prefab/EditLayerItem"));
            this.contentNode.addChild(item);

            const controller = item.getComponent(EditLayerItemController);
            const selected = layerData === EditorData.nowLayerData;
            controller.setData(selected, layerData.name, layerData.visible, layerData.locked);
        }
    }
}


