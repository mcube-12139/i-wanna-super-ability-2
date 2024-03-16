import { _decorator, Component, EventKeyboard, EventMouse, EventTouch, Input, input, KeyCode, Node } from 'cc';
import { EditSceneController } from './EditSceneController';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('StageController')
export class StageController extends Component {
    @property(Node)
    objectShadow: Node;

    mouseX: number = 0;
    mouseY: number = 0;
    // 按住 Alt 时鼠标无视网格
    altHeld: boolean = false;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onTouchStart(event: EventTouch) {
        const uiLocation = event.getUILocation();
        this.setMousePosition(uiLocation.x, uiLocation.y);
        this.createObject(this.mouseX, this.mouseY);
    }

    onTouchMove(event: EventTouch) {
        const uiLocation = event.getUILocation();
        const updated = this.setMousePosition(uiLocation.x, uiLocation.y);
        if (updated && !this.altHeld) {
            this.createObject(this.mouseX, this.mouseY);
        }
    }

    onMouseMove(event: EventMouse) {
        const uiLocation = event.getUILocation();
        this.setMousePosition(uiLocation.x, uiLocation.y);
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ALT_LEFT) {
            this.altHeld = true;
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ALT_LEFT) {
            this.altHeld = false;
        }
    }

    setMousePosition(x: number, y: number): boolean {
        let mouseX: number;
        let mouseY: number;
        // 根据 Alt 是否按住，计算网格坐标
        if (!this.altHeld) {
            mouseX = EditSceneController.instance.gridWidth * Math.floor(x / EditSceneController.instance.gridWidth);
            mouseY = EditSceneController.instance.gridHeight * Math.floor(y / EditSceneController.instance.gridHeight);
        } else {
            mouseX = x;
            mouseY = y;
        }

        const updated = mouseX !== this.mouseX || mouseY !== this.mouseY;
        if (updated) {
            this.mouseX = mouseX;
            this.mouseY = mouseY;
            // 更新影子坐标
            this.objectShadow.setPosition(mouseX, mouseY);
        }
        return updated;
    }

    createObject(x: number, y: number) {
        const node = SweetGlobal.createOnLayerByPrefab(EditSceneController.instance.nowPrefabName, EditSceneController.instance.nowPrefabData.layer);
        node.setPosition(x, y);
    }
}