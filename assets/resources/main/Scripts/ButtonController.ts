import { CCBoolean, Color, Label } from 'cc';
import { Enum } from 'cc';
import { director } from 'cc';
import { Input } from 'cc';
import { CCFloat } from 'cc';
import { _decorator, Component, Graphics } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

enum ButtonActionId {
    START_GAME,
    LOAD_GAME,
    SELECT_LEVEL,
    SETTING
}

@ccclass('ButtonController')
export class ButtonController extends Component {
    static actionIdMap = new Map<ButtonActionId, (controller: ButtonController) => void>([
        [ButtonActionId.START_GAME, controller => {
            SweetGlobal.autosave = true;
            EditSceneController.initData();
            director.loadScene("edit");
        }],
        [ButtonActionId.LOAD_GAME, controller => {
            SweetGlobal.loadFile();
        }],
        [ButtonActionId.SELECT_LEVEL, controller => {
            director.loadScene("selectLevel");
        }],
        [ButtonActionId.SETTING, controller => {
            director.loadScene("setting");
        }]
    ]);

    @property({type: Enum(ButtonActionId)})
    actionId: ButtonActionId;
    @property(CCFloat)
    width: number;
    @property(CCFloat)
    height: number;
    @property(CCBoolean)
    buttonEnabled: boolean = true;

    private graphics: Graphics;
    private text: Label;

    start() {
        // 画出背景
        this.graphics = this.node.getChildByName("Background").getComponent(Graphics);
        this.graphics.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        this.graphics.fill();

        this.text = this.node.getChildByName("Text").getComponent(Label);

        // 设置触摸事件
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    disableButton() {
        this.buttonEnabled = false;
        this.text.color = new Color(255, 255, 255, 128);
    }

    onTouchStart() {
        if (this.buttonEnabled) {
            ButtonController.actionIdMap.get(this.actionId)(this);
        }
    }
}


