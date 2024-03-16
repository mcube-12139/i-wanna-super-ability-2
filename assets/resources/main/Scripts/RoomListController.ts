import { _decorator, Component, instantiate, Prefab, Node } from 'cc';
import { RoomListItemController, RoomListItemData } from './RoomListItemController';
const { ccclass, property } = _decorator;

@ccclass('RoomListController')
export class RoomListController extends Component {
    dataList: RoomListItemData[] = [
        new RoomListItemData("123", "2024.3.14"),
        new RoomListItemData("321", "1919.8.10"),
        new RoomListItemData("321", "1919.8.10"),
        new RoomListItemData("321", "1919.8.10"),
        new RoomListItemData("321", "1919.8.10"),
        new RoomListItemData("321", "1919.8.10"),
        new RoomListItemData("321", "1919.8.10"),
        new RoomListItemData("321", "1919.8.10"),
        new RoomListItemData("999", "1919.8.10"),
    ];

    @property(Prefab)
    itemPrefab: Prefab;
    @property(Node)
    contentNode: Node;

    onLoad() {
        for (const [_, data] of this.dataList.entries()) {
            const item = instantiate(this.itemPrefab);
            item.getComponent(RoomListItemController).setData(data);
            this.contentNode.addChild(item);
        }
    }
}


