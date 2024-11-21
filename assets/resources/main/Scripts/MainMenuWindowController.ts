import { _decorator, Component, EventKeyboard, Input, input, instantiate, KeyCode, Node } from 'cc';
import { EditData } from './Edit/EditData';
import { MainMenuOptionController, MainMenuOptionId } from './MainMenuOptionController';
const { ccclass, property } = _decorator;

@ccclass('MainMenuWindowController')
export class MainMenuWindowController extends Component {
    @property(Node)
    optionParent!: Node;
    @property(Node)
    pageParent!: Node;

    pagePrefabs = new Map<MainMenuOptionId, MainMenuOptionController>();
    option?: MainMenuOptionController = undefined;
    page?: Node = undefined;

    onEnable() {
        for (const child of this.optionParent.children) {
            const control = child.getComponent(MainMenuOptionController)!;
            this.pagePrefabs.set(control.optionId, control);
            child.on(Node.EventType.TOUCH_END, (event: TouchEvent) => {
                this.toggleOption(control.optionId);
            }, this);
            child.on(Node.EventType.MOUSE_ENTER, (event: TouchEvent) => {
                control.background.active = true;
            }, this);
            child.on(Node.EventType.MOUSE_LEAVE, (event: TouchEvent) => {
                if (this.option !== control) {
                    control.background.active = false;
                }
            }, this);
        }
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(e: EventKeyboard) {
        if (e.keyCode === KeyCode.ESCAPE) {
            EditData.instance.closeWindow();
        }
    }

    toggleOption(option: MainMenuOptionId) {
        if (this.page !== undefined) {
            this.page.destroy();
        }
        if (this.option !== undefined) {
            this.option.background.active = false;
        }
        const control = this.pagePrefabs.get(option)!;
        const node = instantiate(control.pagePrefab);
        this.pageParent.addChild(node);
        this.page = node;

        this.option = control;
        control.background.active = true;
    }
}
