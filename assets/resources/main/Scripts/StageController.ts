import { _decorator, Component, director, EventKeyboard, EventMouse, Input, input, KeyCode, Node } from 'cc';
import { EditSceneController } from './EditSceneController';
import { MainMenuOptionId } from './MainMenuOptionController';
import { EditorData } from './EditorData';
const { ccclass, property } = _decorator;

@ccclass('StageController')
export class StageController extends Component {
    @property(Node)
    objectShadow: Node;

    noSnapMouseX = 0;
    noSnapMouseY = 0;
    mouseX = 0;
    mouseY = 0;
    ctrlHeld = false;
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
            } else if (event.keyCode === KeyCode.CTRL_LEFT) {
                this.ctrlHeld = true;
            } else if (event.keyCode === KeyCode.F3) {
                // F3 - 打开"物体"页面
                EditSceneController.instance.openMainMenuWindow(MainMenuOptionId.OBJECT);
            } else if (event.keyCode === KeyCode.KEY_R && this.ctrlHeld) {
                // Ctrl + R - 运行预览
                director.loadScene("preview");
            }
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (EditSceneController.instance.nowWindow === null) {
            if (event.keyCode === KeyCode.ALT_LEFT) {
                this.altHeld = false;
            } else if (event.keyCode === KeyCode.CTRL_LEFT) {
                this.ctrlHeld = false;
            }
        }
    }

    setMousePosition(x: number, y: number): boolean {
        this.noSnapMouseX = x;
        this.noSnapMouseY = y;

        let mouseX: number;
        let mouseY: number;
        // 根据 Alt 是否按住，计算网格坐标
        if (!this.altHeld) {
            mouseX = EditorData.gridWidth * Math.floor(x / EditorData.gridWidth);
            mouseY = EditorData.gridHeight * Math.floor(y / EditorData.gridHeight);
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
        EditorData.addObject(this.mouseX, this.mouseY);
    }

    deleteObject() {
        EditorData.deleteObject(this.noSnapMouseX, this.noSnapMouseY);
    }
}