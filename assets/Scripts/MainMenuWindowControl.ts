import { _decorator, Component, EventKeyboard, Input, input, instantiate, KeyCode, Node, Prefab } from 'cc';
import { Editor } from './Edit/Editor';
import { MainMenuOptionController, MainMenuOptionId } from './MainMenuOptionController';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('MainMenuWindowControl')
export class MainMenuWindowControl extends Component {
    @property(MainMenuOptionController)
    resourceOptionControl!: MainMenuOptionController;
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
            Editor.instance.closeWindow();
        }
    }

    createOptions(options: MainMenuOptionId[]) {
        for (const optionId of options) {
            let text: string;
            let pagePrefab: Prefab;

            if (optionId === MainMenuOptionId.EDIT) {
                text = "编辑";
                pagePrefab = SweetGlobal.editPagePrefab;
            } else if (optionId === MainMenuOptionId.NODE_TREE) {
                text = "节点树";
                pagePrefab = SweetGlobal.nodeTreePagePrefab;
            } else {
                text = "节点";
                pagePrefab = SweetGlobal.nodePagePrefab;
            }
            
            const option = instantiate(SweetGlobal.menuOptionPrefab);
            this.optionParent.addChild(option);
            const control = option.getComponent(MainMenuOptionController)!;
            this.pagePrefabs.set(control.optionId, control);
            option.on(Node.EventType.TOUCH_END, (event: TouchEvent) => {
                this.toggleOption(control.optionId);
            }, this);
            option.on(Node.EventType.MOUSE_ENTER, (event: TouchEvent) => {
                control.background.active = true;
            }, this);
            option.on(Node.EventType.MOUSE_LEAVE, (event: TouchEvent) => {
                if (this.option !== control) {
                    control.background.active = false;
                }
            }, this);
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
