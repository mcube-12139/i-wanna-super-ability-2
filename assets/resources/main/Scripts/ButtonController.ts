import { CCBoolean, Color, Label, Node, UITransform } from 'cc';
import { _decorator, Component, Graphics } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonController')
export class ButtonController extends Component {
    @property(Label)
    label!: Label;
    @property(Graphics)
    graphics!: Graphics;
    @property(CCBoolean)
    buttonEnabled: boolean = true;

    start() {
        // 设置触摸事件
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    onTouchEnd(fun: (event: TouchEvent) => void) {
        this.node.on(Node.EventType.TOUCH_END, (event: TouchEvent) => {
            if (this.buttonEnabled) {
                fun(event);
            }
        }, this);
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
        if (this.buttonEnabled) {
            this.graphics.fillColor.set(255, 255, 255, 77);
            this.redraw();
        }
    }

    onMouseLeave() {
        if (this.buttonEnabled) {
            this.graphics.clear();
        }
    }
}


