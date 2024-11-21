import { _decorator, Component, EditBox, instantiate, Label, Layout, Node, Prefab, resources, Sprite, SpriteFrame, Toggle } from 'cc';
import { IEditResource } from './Resource/IEditResource';
import { ResourceListControl } from './ResourceListControl';
import { ButtonController } from '../ButtonController';
import { SweetGlobal } from '../SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('ResourceItemControl')
export class ResourceItemControl extends Component {
    @property(Sprite)
    icon!: Sprite;
    @property(Label)
    resourceName!: Label;
    @property(Node)
    children?: Node;
    @property(Sprite)
    background!: Sprite;

    parent?: ResourceItemControl;
    data!: IEditResource;
    withChildren!: boolean;
    childrenVisible!: boolean;

    // 引擎 bug 处理
    destroyTime: number = 0;

    update(dt: number): void {
        if (this.destroyTime >= 0) {
            --this.destroyTime;
            if (this.destroyTime === 0) {
                this.node.destroy();
            }
        }
    }

    initName(icon: SpriteFrame, over: (name: string) => boolean) {
        this.icon.spriteFrame = icon;
        
        this.resourceName.node.active = false;
        const node = instantiate(SweetGlobal.sweetInputPrefab);
        node.on("editing-did-ended", (editBox: EditBox) => {
            const name = editBox.textLabel!.string;
            if (over(name)) {
                this.resourceName.node.active = true;
                this.resourceName.string = name;
                this.resourceName.node.parent!.removeChild(node);
            } else {
                this.destroyTime = 1;
            }
        }, this);
        this.resourceName.node.parent!.insertChild(node, this.resourceName.node.parent!.children.indexOf(this.resourceName.node));
        this.resourceName.node.parent!.getComponent(Layout)!.updateLayout();
        this.node.parent!.getComponent(Layout)!.updateLayout();
        node.getComponent(EditBox)!.focus();
    }

    setData(data: IEditResource): void {
        this.data = data;
        
        let sprite: SpriteFrame;
        if (data.children === undefined) {
            this.withChildren = false;
            this.children!.destroy();
            this.children = undefined;
            sprite = data.icon!;
        } else {
            this.withChildren = true;
            this.childrenVisible = true;
            sprite = SweetGlobal.expandedSprite;
        }
        this.icon.spriteFrame = sprite;
        this.resourceName.string = data.name;
    }

    open(): void {
        this.childrenVisible = !this.childrenVisible;
        this.children!.active = this.childrenVisible;
        this.icon.spriteFrame = this.childrenVisible ? SweetGlobal.expandedSprite : SweetGlobal.collapsedSprite;
    }

    setEvents(elements: {
        list: ResourceListControl,
        enableMultiple: Toggle,
        open: ButtonController,
        createRoom: ButtonController
    }) {
        this.background.node.on(Node.EventType.MOUSE_ENTER, (e: MouseEvent) => this.onMouseEnter(e, elements.list), this);
        this.background.node.on(Node.EventType.MOUSE_LEAVE, (e: MouseEvent) => this.onMouseLeave(e, elements.list), this);
        this.background.node.on(Node.EventType.TOUCH_END, (e: TouchEvent) => {
            if (!elements.enableMultiple.isChecked) {
                if (this.withChildren) {
                    this.open();
                }

                elements.list.setSelectedItems(this);
            } else {
                elements.list.selectItem(this);
            }

            if (elements.list.selectedItems.length === 1) {
                if (this.withChildren) {
                    elements.open.setEnabled(false);
                } else {
                    elements.open.setEnabled(true);
                }

                elements.createRoom.setEnabled(true);
            } else {
                elements.createRoom.setEnabled(false);
            }
        }, this);

        if (this.withChildren) {
            for (const child of this.children!.children) {
                child.getComponent(ResourceItemControl)!.setEvents(elements);
            }
        }
    }

    select(): void {
        this.background.enabled = true;
    }

    deselect(): void {
        this.background.enabled = false;
    }

    onMouseEnter(event: MouseEvent, listControl: ResourceListControl) {
        this.background.enabled = true;
    }

    onMouseLeave(event: MouseEvent, listControl: ResourceListControl) {
        if (!listControl.isItemSelected(this)) {
            this.background.enabled = false;
        }
    }
}


