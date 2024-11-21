import { _decorator, Component, instantiate, Prefab, resources, Toggle } from 'cc';
import { ResourceListControl } from './Edit/ResourceListControl';
import { ButtonController } from './ButtonController';
import { RoomResource } from './Edit/Resource/RoomResource';
import { ResourceItemControl } from './Edit/ResourceItemControl';
import { EditResourceTool } from './Edit/Resource/EditResourceTool';
import { EditResourceType } from './Edit/Resource/EditResourceType';
import { ErrorControl } from './ErrorControl';
import { IEditResource } from './Edit/Resource/IEditResource';
import { EditData } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('ResourcePageControl')
export class ResourcePageControl extends Component {
    @property(Prefab)
    resourcePrefab!: Prefab;
    @property(ResourceListControl)
    resourceList!: ResourceListControl;
    @property(Toggle)
    enableMultiple!: Toggle;
    @property(ButtonController)
    openButton!: ButtonController;
    @property(ButtonController)
    createRoomButton!: ButtonController;
    @property(ErrorControl)
    errorControl!: ErrorControl;

    start() {
        this.resourceList.init({
            enableMultiple: this.enableMultiple,
            open: this.openButton,
            createRoom: this.createRoomButton
        });

        this.openButton.onTouchEnd((e: TouchEvent) => {
            EditData.instance.closeWindow();
            const selected = this.resourceList.selectedItems[0];
            EditData.instance.openPage(selected.data);
        });

        this.createRoomButton.onTouchEnd((e: TouchEvent) => {
            const selected = this.resourceList.selectedItems[0];

            const itemNode = instantiate(this.resourcePrefab);

            let parent: ResourceItemControl;
            let before: IEditResource | undefined;
            if (selected.withChildren) {
                // 选中项是组类型，创建资源作为子节点
                parent = selected;
                before = undefined;

                if (!selected.childrenVisible) {
                    selected.open();
                }
                selected.children!.addChild(itemNode);
            } else {
                // 选中项不是组类型，创建资源作为同级节点，位置在本节点的原来位置
                parent = selected.parent!;
                before = selected.data;

                parent.children!.insertChild(itemNode, parent!.children!.children.indexOf(selected.node));
            }

            const itemControl = itemNode.getComponent(ResourceItemControl)!;
            // 开始设置名称
            itemControl.initName(
                RoomResource.icon,
                (name: string) => {
                    if (name.length === 0) {
                        this.errorControl.show("房间名不能是空");
                        return false;
                    }
                    if (EditResourceTool.findTypeName(selected.data, EditResourceType.ROOM, name) !== undefined) {
                        this.errorControl.show("房间名重复");
                        return false;
                    }

                    // 创建资源，保存
                    const {resource, data} = RoomResource.createResourceAndData(name);
                    data.save();
                    EditData.instance.addResource(resource, parent.data, before);
                    // 附加到节点上
                    itemControl.setData(resource);
                    itemControl.setEvents({
                        list: this.resourceList,
                        enableMultiple: this.enableMultiple,
                        open: this.openButton,
                        createRoom: this.createRoomButton
                    });

                    return true;
                }
            );
        });
    }

    update(deltaTime: number) {
        
    }
}


