import { _decorator, Component, EventKeyboard, Input, input, instantiate, KeyCode, Node, Prefab } from 'cc';
import { EditData } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('MainMenuWindowController')
export class MainMenuWindowController extends Component {
    @property(Node)
    pageParent!: Node;

    page?: Node = undefined;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(e: EventKeyboard) {
        if (e.keyCode === KeyCode.ESCAPE) {
            EditData.instance.closeWindow();
        }
    }

    openPage(page: Prefab) {
        if (this.page !== undefined) {
            this.page.destroy();
        }
        const node = instantiate(page);
        this.pageParent.addChild(node);
        this.page = node;
    }
}
