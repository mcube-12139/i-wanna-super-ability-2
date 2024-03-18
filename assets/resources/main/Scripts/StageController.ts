import { _decorator, Component, EventKeyboard, EventMouse, EventTouch, Input, input, KeyCode, Node } from 'cc';
import { EditSceneController } from './EditSceneController';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('StageController')
export class StageController extends Component {
    @property(Node)
    objectShadow: Node;

    mouseX = 0;
    mouseY = 0;
    // 按住 Alt 时鼠标无视网格
    altHeld = false;
    leftMouseHeld = false;
    rightMouseHeld = false;

    start() {
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onMouseDown(event: EventMouse) {
        if (EditSceneController.instance.nowWindow === null) {
            const button = event.getButton();
            const uiLocation = event.getUILocation();
            this.setMousePosition(uiLocation.x, uiLocation.y);
            if (button === EventMouse.BUTTON_LEFT) {
                // 左键创建
                this.leftMouseHeld = true;
                this.createObject();
            } else if (button === EventMouse.BUTTON_RIGHT) {
                // 右键删除
                this.rightMouseHeld = true;
                this.deleteObject();
            }
        }
    }

    onMouseMove(event: EventMouse) {
        if (EditSceneController.instance.nowWindow === null) {
            const uiLocation = event.getUILocation();
            const updated = this.setMousePosition(uiLocation.x, uiLocation.y);
            if (this.leftMouseHeld) {
                if (updated && !this.altHeld) {
                    this.createObject();
                }
            } else if (this.rightMouseHeld) {
                if (updated && !this.altHeld) {
                    this.deleteObject();
                }
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (EditSceneController.instance.nowWindow === null) {
            const button = event.getButton();
            if (button === EventMouse.BUTTON_LEFT) {
                this.leftMouseHeld = false;
            } else if (button === EventMouse.BUTTON_RIGHT) {
                this.rightMouseHeld = false;
            }
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (EditSceneController.instance.nowWindow === null) {
            if (event.keyCode === KeyCode.ALT_LEFT) {
                this.altHeld = true;
            }
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (EditSceneController.instance.nowWindow === null) {
            if (event.keyCode === KeyCode.ALT_LEFT) {
                this.altHeld = false;
            }
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

    createObject() {
        EditSceneController.instance.addObject(this.mouseX, this.mouseY);
    }

    deleteObject() {
        EditSceneController.instance.deleteObject(this.mouseX, this.mouseY);
    }
}