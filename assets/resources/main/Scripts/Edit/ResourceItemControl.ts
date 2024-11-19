import { _decorator, Component, Label, Node, resources, Sprite, SpriteFrame } from 'cc';
import { IEditResource } from './Resource/IEditResource';
import { EditResourceTool } from './Resource/EditResourceTool';
import { ResourceListControl } from './ResourceListControl';
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
            sprite = EditResourceTool.getMetadata(data.type).sprite!;
        } else {
            this.childrenVisible = true;
            sprite = resources.get("main/Sprites/expanded/spriteFrame", SpriteFrame)!;
        }
        this.icon.spriteFrame = sprite;
        this.resourceName.string = data.name;
    }

    initEvents(listControl: ResourceListControl) {
        this.background.node.on(Node.EventType.MOUSE_ENTER, (e: MouseEvent) => this.onMouseEnter(e, listControl), this);
        this.background.node.on(Node.EventType.MOUSE_LEAVE, (e: MouseEvent) => this.onMouseLeave(e, listControl), this);
        this.background.node.on(Node.EventType.TOUCH_END, (e: TouchEvent) => this.onTouchEnd(e, listControl), this);

        if (this.children !== undefined) {
            for (const child of this.children.children) {
                child.getComponent(ResourceItemControl)!.initEvents(listControl);
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

    onTouchEnd(event: TouchEvent, listControl: ResourceListControl) {
        if (this.children !== undefined) {
            this.childrenVisible = !this.childrenVisible;
            this.children!.active = this.childrenVisible;
            this.icon.spriteFrame = resources.get(`main/Sprites/${this.childrenVisible ? "expanded" : "collapsed"}/spriteFrame`, SpriteFrame)!;
        }
        listControl.setSelectedItems(this);
    }
}


