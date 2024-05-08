import { _decorator, Component, instantiate, Node, resources } from 'cc';
import { RoomLayerItemController } from './RoomLayerItemController';
import { EditSceneController } from './EditSceneController';
import { LayerData } from './LayerData';
const { ccclass, property } = _decorator;

@ccclass('RoomLayerListController')
export class RoomLayerListController extends Component {
    @property(Node)
    content: Node;

    selectedItem: RoomLayerItemController = null;

    start() {
        for (const [i, data] of EditSceneController.layers.entries()) {
            const item = instantiate(resources.get("main/Prefab/RoomLayerItem"));
            this.content.addChild(item);
            const control = item.getComponent(RoomLayerItemController);
            control.setData(data);
        }
    }

    selectItem(item: RoomLayerItemController) {
        if (this.selectedItem !== null) {
            this.selectedItem.background.enabled = false;
        }
        this.selectedItem = item;
        this.selectedItem.background.enabled = true;
    }

    createItem() {
        const item = instantiate(resources.get("main/Prefab/RoomLayerItem"));
        let before: LayerData;
        if (this.selectedItem === null) {
            this.content.addChild(item);
            before = null;
        } else {
            this.content.insertChild(item, this.content.children.indexOf(this.selectedItem.node));
            before = this.selectedItem.data;
        }
        const control = item.getComponent(RoomLayerItemController);
        const newData = EditSceneController.createLayer(before);
        control.setData(newData);
        if (this.selectedItem !== null) {
            this.selectItem(control);
        }
        control.editName();
    }

    deleteItem() {
        this.selectedItem.doDelete();

        if (this.selectedItem !== null) {
            const index = this.node.children.indexOf(this.selectedItem.node);
            if (index < this.node.children.length - 1) {
                this.selectItem(this.node.children[index + 1].getComponent(RoomLayerItemController));
            } else {
                this.selectedItem = null;
            }

            this.node.removeChild(this.selectedItem.node);
        }
    }

    renameItem() {
        if (this.selectedItem !== null) {
            this.selectedItem.editName();
        }
    }

    moveUpItem() {
        const index = this.node.children.indexOf(this.selectedItem.node);
        if (index > 0) {
            const nowNode = this.selectedItem.node;
            this.node.removeChild(nowNode);
            this.node.insertChild(nowNode, index - 1);

            this.selectedItem.doMoveUp();
        }
    }

    moveDownItem() {
        const index = this.node.children.indexOf(this.selectedItem.node);
        if (index !== -1 && index < this.node.children.length - 1) {
            const next = this.node.children[index + 1];

            const nowNode = this.selectedItem.node;
            this.node.removeChild(nowNode);
            this.node.insertChild(nowNode, index + 1);

            this.selectedItem.doMoveDown();
        }
    }
}


