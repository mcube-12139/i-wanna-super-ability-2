import { _decorator, Component, director, EventKeyboard, EventMouse, Input, input, KeyCode, Vec2, Vec3 } from 'cc';
import { EditData } from './EditData';
import { MainMenuOptionId } from '../MainMenuOptionController';
import { RoomEditPage } from './Page/RoomEditPage';
const { ccclass, property } = _decorator;

const enum StageAction {
    NONE,
    CREATE,
    DELETE,
    DRAG,
    SELECT_REGION
}

@ccclass('StageControl')
export class StageControl extends Component {
    noSnapMousePos = new Vec2(0, 0);
    mousePos = new Vec2(0, 0);
    ctrlHeld = false;
    shiftHeld = false;
    altHeld = false;
    action: StageAction = StageAction.NONE;

    start() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onMouseDown(event: EventMouse) {
        const page = EditData.instance.nowPage as RoomEditPage;

        if (EditData.instance.nowWindow === null) {
            const button = event.getButton();
            const uiLocation = event.getUILocation();
            this.setMousePosition(uiLocation);
            if (button === EventMouse.BUTTON_LEFT) {
                if (!this.shiftHeld) {
                    // 左键
                    const instance = page.getInstanceAt(uiLocation);
                    if (instance === null) {
                        // 没点到物体，创建
                        this.action = StageAction.CREATE;
                        page.startCreate();
                        this.createObject();
                    } else {
                        // 点到物体了，选中并拖动
                        this.action = StageAction.DRAG;
                        if (!page.selectors.has(instance)) {
                            page.selectInstances([instance]);
                        }
                        page.startDrag(this.mousePos);
                    }
                } else {
                    // Shift + 左键，框选
                    this.action = StageAction.SELECT_REGION;
                    page.startSelectRegion(this.noSnapMousePos);
                }
            } else if (button === EventMouse.BUTTON_RIGHT) {
                // 右键，取消选择，并开始删除
                this.action = StageAction.DELETE;
                page.startDelete();

                const instance = page.getInstanceAt(this.noSnapMousePos);
                if (instance === null) {
                    page.selectInstances([]);
                } else {
                    page.deleteInstance(instance);
                }
            }
        }
    }

    onMouseMove(event: EventMouse) {
        const page = EditData.instance.nowPage as RoomEditPage;

        if (EditData.instance.nowWindow === null) {
            const uiLocation = event.getUILocation();
            const localPos = new Vec3();
            this.node.inverseTransformPoint(localPos, new Vec3(uiLocation.x, uiLocation.y, 0));
            const updated = this.setMousePosition(new Vec2(localPos.x, localPos.y));
            if (this.action === StageAction.CREATE) {
                if (updated && !this.altHeld) {
                    this.createObject();
                }
            } else if (this.action === StageAction.DRAG) {
                if (updated) {
                    page.dragTo(this.mousePos);
                }
            } else if (this.action === StageAction.DELETE) {
                if (updated && !this.altHeld) {
                    const instance = page.getInstanceAt(this.noSnapMousePos);
                    if (instance !== null) {
                        page.deleteInstance(instance);
                    }
                }
            } else if (this.action === StageAction.SELECT_REGION) {
                page.updateSelectRegion(this.noSnapMousePos);
            }
        }
    }

    onMouseUp(event: EventMouse) {
        const page = EditData.instance.nowPage as RoomEditPage;

        if (EditData.instance.nowWindow === null) {
            const button = event.getButton();
            if (button === EventMouse.BUTTON_LEFT) {
                if (this.action === StageAction.CREATE) {
                    this.action = StageAction.NONE;
                    page.endCreate();
                } else if (this.action === StageAction.DRAG) {
                    this.action = StageAction.NONE;
                    page.endDrag();
                } else if (this.action === StageAction.SELECT_REGION) {
                    this.action = StageAction.NONE;
                    page.endSelectRegion();
                }
            } else if (button === EventMouse.BUTTON_RIGHT) {
                if (this.action === StageAction.DELETE) {
                    this.action = StageAction.NONE;
                }
                page.endDelete();
            }
        }
    }

    onKeyDown(event: EventKeyboard) {
        const page = EditData.instance.nowPage as RoomEditPage;

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
                page.undo();
            } else if (event.keyCode === KeyCode.KEY_Y && this.ctrlHeld) {
                // Ctrl + Y - 重做
                page.redo();
            } else if (event.keyCode === KeyCode.KEY_R && this.ctrlHeld) {
                // Ctrl + R - 运行
                director.loadScene("preview");
            } else if (event.keyCode === KeyCode.KEY_S && this.ctrlHeld) {
                // Ctrl + S - 保存
                page.save();
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

    setMousePosition(position: Vec2): boolean {
        const page = EditData.instance.nowPage as RoomEditPage;

        this.noSnapMousePos.set(position);

        let mouseX: number;
        let mouseY: number;
        // 根据 Alt 是否按住，计算网格坐标
        if (!this.altHeld) {
            mouseX = page.gridSize.x * Math.floor(position.x / page.gridSize.x);
            mouseY = page.gridSize.y * Math.floor(position.y / page.gridSize.y);
        } else {
            mouseX = position.x;
            mouseY = position.y;
        }

        const updated = mouseX !== this.mousePos.x || mouseY !== this.mousePos.y;
        if (updated) {
            this.mousePos.set(mouseX, mouseY);
            // 更新影子坐标
            EditData.instance.objectShadow.setPosition(mouseX, mouseY);
        }
        return updated;
    }

    createObject() {
        const page = EditData.instance.nowPage as RoomEditPage;

        page.createInstance(this.mousePos);
    }
}