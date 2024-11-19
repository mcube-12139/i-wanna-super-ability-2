import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame, Toggle } from 'cc';
import { IEditResource } from './Resource/IEditResource';
import { ResourceListControl } from './ResourceListControl';
import { ButtonController } from '../ButtonController';
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

    data!: IEditResource;
    childrenVisible!: boolean;

    setData(data: IEditResource): void {
        this.data = data;
        
        let sprite: SpriteFrame;
        if (data.children === undefined) {
            this.children!.destroy();
            this.children = undefined;
            sprite = data.icon!;
        } else {
            this.childrenVisible = true;
            sprite = resources.get("main/Sprites/expanded/spriteFrame", SpriteFrame)!;
        }
        this.icon.spriteFrame = sprite;
        this.resourceName.string = data.name;
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
            if (this.children !== undefined) {
                this.childrenVisible = !this.childrenVisible;
                this.children!.active = this.childrenVisible;
                this.icon.spriteFrame = resources.get(`main/Sprites/${this.childrenVisible ? "expanded" : "collapsed"}/spriteFrame`, SpriteFrame)!;

                elements.open.setEnabled(false);
            } else {
                elements.open.setEnabled(true);
            }

            if (!elements.enableMultiple) {
                elements.list.setSelectedItems(this);
            } else {
                elements.list.selectItem(this);
            }

            if (elements.list.selectedItems.length === 1) {
                elements.createRoom.setEnabled(true);
            } else {
                elements.createRoom.setEnabled(false);
            }
        }, this);

        if (this.children !== undefined) {
            for (const child of this.children.children) {
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


