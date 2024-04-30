import { _decorator, Component, instantiate, Prefab, Node } from 'cc';
import { RoomListItemController, RoomListItemData } from './RoomListItemController';
import { EditorData } from './EditorData';
const { ccclass, property } = _decorator;

@ccclass('RoomListController')
export class RoomListController extends Component {
    @property(Prefab)
    itemPrefab: Prefab;
    @property(Node)
    contentNode: Node;

    onLoad() {
        for (const [i, data] of EditorData.roomMetadataList.entries()) {
            const item = instantiate(this.itemPrefab);
            this.contentNode.addChild(item);
            const itemData = new RoomListItemData(data.name, data.editTime);
            item.getComponent(RoomListItemController).setData(itemData, EditorData.nowRoomMetadata !== null ? itemData.name === EditorData.nowRoomMetadata.name : false);
        }
    }
}


