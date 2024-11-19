import { CCBoolean, Color, Label, Node, UITransform } from 'cc';
import { Enum } from 'cc';
import { director } from 'cc';
import { _decorator, Component, Graphics } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { ResourceListControl } from './Edit/ResourceListControl';
const { ccclass, property } = _decorator;

enum ButtonActionId {
    START_GAME,
    LOAD_GAME,
    SELECT_LEVEL,
    SETTING,
    OPEN_RESOURCE
}

@ccclass('ButtonController')
export class ButtonController extends Component {
    static actionIdMap = new Map<ButtonActionId, () => void>([
        [ButtonActionId.START_GAME, () => {
            SweetGlobal.autosave = true;
            director.loadScene("edit");
        }],
        [ButtonActionId.LOAD_GAME, () => {
            SweetGlobal.loadFile();
        }],
        [ButtonActionId.SELECT_LEVEL, () => {
            director.loadScene("selectLevel");
        }],
        [ButtonActionId.SETTING, () => {
            director.loadScene("setting");
        }],
        [ButtonActionId.OPEN_RESOURCE, () => {

        }]
    ]);

    @property(Label)
    label!: Label;
    @property(Graphics)
    graphics!: Graphics;
    @property({type: Enum(ButtonActionId)})
    actionId!: ButtonActionId;

    @property({
        type: ResourceListControl,
        visible: function (this: ButtonController) {
            return this.actionId === ButtonActionId.OPEN_RESOURCE;
        }
    })
    list?: ResourceListControl;

    @property(CCBoolean)
    buttonEnabled: boolean = true;

    start() {
        // 设置触摸事件
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    setEnabled(enabled: boolean) {
        this.buttonEnabled = enabled;
        this.label.color = enabled ? new Color(255, 255, 255, 255): new Color(255, 255, 255, 128);
    }

    redraw() {
        const transform = this.getComponent(UITransform)!;
        this.graphics.rect(
            -transform.anchorX * transform.width,
            -transform.anchorY * transform.height,
            transform.width,
            transform.height
        );
        this.graphics.fill();
    }

    onMouseEnter() {
        this.graphics.fillColor.set(255, 255, 255, 77);
        this.redraw();
    }

    onMouseLeave() {
        this.graphics.clear();
    }

    onTouchEnd() {
        if (this.buttonEnabled) {
            ButtonController.actionIdMap.get(this.actionId)!.bind(this)();
        }
    }
}


