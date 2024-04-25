import { _decorator, Component, instantiate, Node, Prefab, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MenuOptionController')
export class MenuOptionController extends Component {
    @property(Sprite)
    background: Sprite;
    @property(Node)
    container: Node;
    @property(Prefab)
    view: Prefab;

    selected: boolean = false;

    start() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    select() {
        // 取消其他选项选中
        const children = this.node.parent.children;
        for (const child of children) {
            const controller = child.getComponent(MenuOptionController);
            if (controller.selected) {
                controller.unselect();
            }
        }
        
        this.selected = true;
        this.background.enabled = true;
        const viewNode = instantiate(this.view);
        this.container.addChild(viewNode);
    }

    unselect() {
        // 关闭打开的页面
        this.container.removeAllChildren();

        this.selected = false;
        this.background.enabled = false;
    }

    onMouseEnter(_) {
        this.background.enabled = true;
    }

    onMouseLeave(_) {
        if (!this.selected) {
            this.background.enabled = false;
        }
    }

    onMouseUp(_) {
        if (!this.selected) {
            this.select();
        }
    }
}


