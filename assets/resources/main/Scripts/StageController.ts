import { _decorator, Component, director, EventKeyboard, EventMouse, Input, input, KeyCode, Node } from 'cc';
import { EditData } from './Edit/EditData';
import { MainMenuOptionId } from './MainMenuOptionController';
const { ccclass, property } = _decorator;

const enum StageAction {
    NONE,
    CREATE,
    DELETE,
    DRAG,
    SELECT_REGION
}

@ccclass('StageController')
export class StageController extends Component {
    @property(Node)
    objectShadow: Node;

    noSnapMouseX = 0;
    noSnapMouseY = 0;
    mouseX = 0;
    mouseY = 0;
    ctrlHeld = false;
    shiftHeld = false;
    altHeld = false;
    action: number;

    start() {
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onMouseDown(event: EventMouse) {
        if (EditData.instance.nowWindow === null) {
            const button = event.getButton();
            const uiLocation = event.getUILocation();
            this.setMousePosition(uiLocation.x, uiLocation.y);
            if (button === EventMouse.BUTTON_LEFT) {
                if (!this.shiftHeld) {
                    // 左键
                    const object = EditData.getObjectAt(uiLocation.x, uiLocation.y);
                    if (object === null) {
                        // 没点到物体，创建
                        this.action = StageAction.CREATE;
                        EditData.startCreate();
                        this.createObject();
                    } else {
                        // 点到物体了，选中并拖动
                        this.action = StageAction.DRAG;
                        if (!EditData.selectedObjects.includes(object)) {
                            EditData.selectObjects([object]);
                        }
                        EditData.startDrag(this.mouseX, this.mouseY);
                    }
                } else {
                    // Shift + 左键，框选
                    this.action = StageAction.SELECT_REGION;
                    EditData.instance.startSelectRegion(this.noSnapMouseX, this.noSnapMouseY);
                }
            } else if (button === EventMouse.BUTTON_RIGHT) {
                // 右键，取消选择，并开始删除
                this.action = StageAction.DELETE;
                EditData.startDelete();

                const object = EditData.getObjectAt(this.noSnapMouseX, this.noSnapMouseY);
                if (object === null) {
                    EditData.selectObjects([]);
                } else {
                    EditData.deleteObject(object);
                }
            }
        }
    }

    onMouseMove(event: EventMouse) {
        if (EditData.instance.nowWindow === null) {
            const uiLocation = event.getUILocation();
            const updated = this.setMousePosition(uiLocation.x, uiLocation.y);
            if (this.action === StageAction.CREATE) {
                if (updated && !this.altHeld) {
                    this.createObject();
                }
            } else if (this.action === StageAction.DRAG) {
                if (updated) {
                    EditData.dragTo(this.mouseX, this.mouseY);
                }
            } else if (this.action === StageAction.DELETE) {
                if (updated && !this.altHeld) {
                    const object = EditData.getObjectAt(this.noSnapMouseX, this.noSnapMouseY);
                    if (object !== null) {
                        EditData.deleteObject(object);
                    }
                }
            } else if (this.action === StageAction.SELECT_REGION) {
                EditData.instance.updateSelectRegion(this.noSnapMouseX, this.noSnapMouseY);
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (EditData.instance.nowWindow === null) {
            const button = event.getButton();
            if (button === EventMouse.BUTTON_LEFT) {
                if (this.action === StageAction.CREATE) {
                    this.action = StageAction.NONE;
                    EditData.endCreate();
                } else if (this.action === StageAction.DRAG) {
                    this.action = StageAction.NONE;
                    EditData.endDrag();
                } else if (this.action === StageAction.SELECT_REGION) {
                    this.action = StageAction.NONE;
                    EditData.instance.endSelectRegion(this.noSnapMouseX, this.noSnapMouseY);
                }
            } else if (button === EventMouse.BUTTON_RIGHT) {
                if (this.action === StageAction.DELETE) {
                    this.action = StageAction.NONE;
                }
                EditData.endDelete();
            }
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (EditData.instance.nowWindow === null) {
            if (event.keyCode === KeyCode.ALT_LEFT) {
                this.altHeld = true;
            } else if (event.keyCode === KeyCode.SHIFT_LEFT) {
                this.shiftHeld = true;
            } else if (event.keyCode === KeyCode.CTRL_LEFT) {
                this.ctrlHeld = true;
            } else if (event.keyCode === KeyCode.F1) {
                // F1 - 打开"文件"页面
                EditData.instance.openMainMenuWindow(MainMenuOptionId.FILE);
            } else if (event.keyCode === KeyCode.F2) {
                // F2 - 打开"编辑"页面
                EditData.instance.openMainMenuWindow(MainMenuOptionId.EDIT);
            } else if (event.keyCode === KeyCode.F3) {
                // F3 - 打开"房间"页面
                EditData.instance.openMainMenuWindow(MainMenuOptionId.ROOM);
            } else if (event.keyCode === KeyCode.F4) {
                // F4 - 打开"物体"页面
                EditData.instance.openMainMenuWindow(MainMenuOptionId.OBJECT);
            } else if (event.keyCode === KeyCode.F5) {
                // F5 - 打开"实例"页面
                EditData.instance.openMainMenuWindow(MainMenuOptionId.INSTANCE);
            } else if (event.keyCode === KeyCode.KEY_Z && this.ctrlHeld) {
                // Ctrl + Z - 撤销
                EditData.undo();
            } else if (event.keyCode === KeyCode.KEY_Y && this.ctrlHeld) {
                // Ctrl + Y - 重做
                EditData.redo();
            } else if (event.keyCode === KeyCode.KEY_R && this.ctrlHeld) {
                // Ctrl + R - 运行
                director.loadScene("preview");
            } else if (event.keyCode === KeyCode.KEY_S && this.ctrlHeld) {
                // Ctrl + S - 保存
                EditData.saveRoom();
            }
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (EditData.instance.nowWindow === null) {
            if (event.keyCode === KeyCode.ALT_LEFT) {
                this.altHeld = false;
            } else if (event.keyCode === KeyCode.CTRL_LEFT) {
                this.ctrlHeld = false;
            } else if (event.keyCode === KeyCode.SHIFT_LEFT) {
                this.shiftHeld = false;
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
            mouseX = EditData.gridWidth * Math.floor(x / EditData.gridWidth);
            mouseY = EditData.gridHeight * Math.floor(y / EditData.gridHeight);
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
        EditData.createObject(this.mouseX, this.mouseY);
    }
}