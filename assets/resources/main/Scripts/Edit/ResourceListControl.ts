import { _decorator, Component, Node, ScrollView, Toggle } from 'cc';
import { EditResourceTool } from './Resource/EditResourceTool';
import { EditData } from './EditData';
import { ResourceItemControl } from './ResourceItemControl';
import { ButtonController } from '../ButtonController';
const { ccclass, property } = _decorator;

@ccclass('ResourceListControl')
export class ResourceListControl extends Component {
    scrollView!: ScrollView;
    selectedItems: ResourceItemControl[] = [];

    init(elements: {
        enableMultiple: Toggle,
        open: ButtonController,
        createRoom: ButtonController
    }) {
        this.scrollView = this.getComponent(ScrollView)!;

        const node = EditResourceTool.createItemNode(EditData.instance.rootResource, 0);
        const nodeControl = node.getComponent(ResourceItemControl)!;
        nodeControl.setEvents({
            list: this,
            enableMultiple: elements.enableMultiple,
            open: elements.open,
            createRoom: elements.createRoom
        });
        this.scrollView.content!.addChild(node);
    }

    selectItem(item: ResourceItemControl) {
        item.select();
        this.selectedItems.push(item);
    }

    setSelectedItems(...items: ResourceItemControl[]) {
        for (const item of this.selectedItems) {
            item.deselect();
        }
        for (const item of items) {
            item.select();
        }
        this.selectedItems = items;
    }

    isItemSelected(item: ResourceItemControl) {
        return this.selectedItems.includes(item);
    }
}


