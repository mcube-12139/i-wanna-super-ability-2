import { _decorator, Component, Node, ScrollView } from 'cc';
import { EditResourceTool } from './Resource/EditResourceTool';
import { EditData } from './EditData';
import { ResourceItemControl } from './ResourceItemControl';
const { ccclass, property } = _decorator;

@ccclass('ResourceListControl')
export class ResourceListControl extends Component {
    scrollView!: ScrollView;
    selectedItems: ResourceItemControl[] = [];

    start() {
        this.scrollView = this.getComponent(ScrollView)!;

        const node = EditResourceTool.createItemNode(EditData.instance.rootResource, 0);
        const nodeControl = node.getComponent(ResourceItemControl)!;
        nodeControl.initEvents(this);
        this.scrollView.content!.addChild(node);
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


