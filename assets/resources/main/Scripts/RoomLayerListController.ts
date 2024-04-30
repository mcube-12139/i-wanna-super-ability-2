import { _decorator, Component, instantiate, Node, resources } from 'cc';
import { RoomLayerItemController } from './RoomLayerItemController';
import { EditorData } from './EditorData';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('RoomLayerListController')
export class RoomLayerListController extends Component {
    @property(Node)
    content: Node;

    selectedIndex: number = -1;
    selectedItem: RoomLayerItemController = null;

    start() {
        for (const [i, data] of EditorData.layers.entries()) {
            const item = instantiate(resources.get("main/Prefab/RoomLayerItem"));
            this.content.addChild(item);
            const control = item.getComponent(RoomLayerItemController);
            control.setData(i, data.name);
        }
    }

    updateIndex(start: number) {
        for (let i = start; i !== this.node.children.length; ++i) {
            const child = this.node.children[i];
            const control = child.getComponent(RoomLayerItemController);
            control.index = i;
        }
    }

    selectItem(index: number) {
        if (this.selectedItem !== null) {
            this.selectedItem.background.enabled = false;
        }
        this.selectedIndex = index;
        this.selectedItem = this.node.children[index].getComponent(RoomLayerItemController);
        this.selectedItem.background.enabled = true;
    }

    createItem() {
        const item = instantiate(resources.get("main/Prefab/RoomLayerItem"));
        let newIndex: number;
        let before: string;
        if (this.selectedIndex === -1) {
            this.content.addChild(item);
            newIndex = this.node.children.length - 1;
            before = "";
        } else {
            this.content.insertChild(item, this.selectedIndex);
            newIndex = this.selectedIndex;
            before = this.selectedItem.layerName;

            // 更新各项号
            this.updateIndex(newIndex + 1);
        }
        const control = item.getComponent(RoomLayerItemController);
        const newName = EditorData.getNewLayerName();
        control.setData(newIndex, newName);
        if (this.selectedIndex !== -1) {
            this.selectItem(newIndex);
        }
        EditSceneController.instance.createLayer(before, newName);
        control.editName();
    }

    deleteItem() {
        this.selectedItem.doDelete();

        if (this.selectedIndex !== -1) {
            this.node.removeChild(this.node.children[this.selectedIndex]);
            this.updateIndex(this.selectedIndex);
        }
        if (this.selectedIndex < this.node.children.length) {
            this.selectedItem = this.node.children[this.selectedIndex].getComponent(RoomLayerItemController);
        } else {
            this.selectedIndex = -1;
        }
    }

    renameItem() {
        if (this.selectedIndex !== -1) {
            this.selectedItem.editName();
        }
    }

    moveUpItem() {
        if (this.selectedIndex > 0) {
            const previous = this.node.children[this.selectedIndex - 1];
            previous.getComponent(RoomLayerItemController).index = this.selectedIndex;

            const nowNode = this.node.children[this.selectedIndex];
            this.selectedItem.index = this.selectedIndex - 1;
            this.node.removeChild(nowNode);
            this.node.insertChild(nowNode, this.selectedIndex - 1);

            --this.selectedIndex;

            this.selectedItem.doMoveUp();
        }
    }

    moveDownItem() {
        if (this.selectedIndex !== -1 && this.selectedIndex < this.node.children.length - 1) {
            const next = this.node.children[this.selectedIndex + 1];
            next.getComponent(RoomLayerItemController).index = this.selectedIndex;

            const nowNode = this.node.children[this.selectedIndex];
            this.selectedItem.index = this.selectedIndex + 1;
            this.node.removeChild(nowNode);
            this.node.insertChild(nowNode, this.selectedIndex + 1);

            ++this.selectedIndex;

            this.selectedItem.doMoveDown();
        }
    }
}


