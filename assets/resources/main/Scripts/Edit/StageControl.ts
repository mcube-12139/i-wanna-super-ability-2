import { _decorator, Component, director, EventKeyboard, EventMouse, Input, input, KeyCode, UITransform, Vec2, Vec3 } from 'cc';
import { Editor } from './Editor';
import { MainMenuOptionId } from '../MainMenuOptionController';
import { RoomEditPage } from './Page/RoomEditPage';
const { ccclass } = _decorator;

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

    startAction(action: StageAction) {
        this.action = action;
        Editor.instance.selectorShadow.active = false;
        Editor.instance.objectShadow.active = false;
    }

    onMouseDown(event: EventMouse) {
        console.log("fuck");
        const page = Editor.instance.nowPage as RoomEditPage;

        if (Editor.instance.nowWindow === undefined) {
            const button = event.getButton();
            const uiLocation = event.getUILocation();
            this.setMousePosition(uiLocation);
            if (button === EventMouse.BUTTON_LEFT) {
                if (!this.shiftHeld) {
                    // 左键
                    const instance = page.getInstanceAt(uiLocation);
                    if (instance === undefined) {
                        // 没点到物体，创建
                        this.startAction(StageAction.CREATE);
                        page.startCreate();
                        page.createInstance(this.mousePos);
                    } else {
                        // 点到物体了，选中并拖动
                        this.startAction(StageAction.DRAG);
                        if (!page.selectors.has(instance)) {
                            page.selectInstances([instance]);
                        }
                        page.startDrag(this.mousePos);
                    }
                } else {
                    // Shift + 左键，框选
                    this.startAction(StageAction.SELECT_REGION);
                    page.startSelectRegion(this.noSnapMousePos);
                }
            } else if (button === EventMouse.BUTTON_RIGHT) {
                // 右键，取消选择，并开始删除
                this.startAction(StageAction.DELETE);
                page.startDelete();

                const instance = page.getInstanceAt(this.noSnapMousePos);
                if (instance === undefined) {
                    page.selectInstances([]);
                } else {
                    page.deleteInstanceMaybeSelected(instance);
                }
            }
        }
    }

    onMouseMove(event: EventMouse) {
        const page = Editor.instance.nowPage as RoomEditPage;

        if (Editor.instance.nowWindow === undefined) {
            const uiLocation = event.getUILocation();
            const localPos = new Vec3();
            this.node.inverseTransformPoint(localPos, new Vec3(uiLocation.x, uiLocation.y, 0));
            const updated = this.setMousePosition(new Vec2(localPos.x, localPos.y));

            const instance = page.getInstanceAt(this.noSnapMousePos);
            if (this.action === StageAction.CREATE) {
                if (updated && !this.altHeld) {
                    page.createInstance(this.mousePos);
                }
            } else if (this.action === StageAction.DRAG) {
                if (updated) {
                    page.dragTo(this.mousePos);
                }
            } else if (this.action === StageAction.DELETE) {
                if (updated && !this.altHeld) {
                    if (instance !== undefined) {
                        page.deleteInstanceMaybeSelected(instance);
                    }
                }
            } else if (this.action === StageAction.SELECT_REGION) {
                page.updateSelectRegion(this.noSnapMousePos);
            } else {
                // 无操作
                if (instance !== undefined) {
                    // 指向了实例，显示选择框影子
                    Editor.instance.objectShadow.active = false;

                    const shadow = Editor.instance.selectorShadow;
                    shadow.active = true;
                    const rect = instance.data.getGlobalRect()!;
                    shadow.setPosition(rect.x - 3, rect.y - 3);
                    shadow.getComponent(UITransform)!.setContentSize(rect.width + 6, rect.height + 6);
                } else {
                    Editor.instance.objectShadow.active = true;
                    Editor.instance.selectorShadow.active = false;
                }
            }
        }
    }

    onMouseUp(event: EventMouse) {
        const page = Editor.instance.nowPage as RoomEditPage;

        if (Editor.instance.nowWindow === undefined) {
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

    openMainMenuWindow(optionId: MainMenuOptionId) {
        const page = Editor.instance.nowPage as RoomEditPage;

        const options = [];
        if (page.selectors.size > 0) {
            options.push(MainMenuOptionId.EDIT, MainMenuOptionId.NODE_TREE, MainMenuOptionId.NODE);
        } else {
            options.push(MainMenuOptionId.EDIT, MainMenuOptionId.NODE_TREE);
        }
        Editor.instance.openMainMenuWindow(options, optionId);
    }

    onKeyDown(event: EventKeyboard) {
        const page = Editor.instance.nowPage as RoomEditPage;

        if (Editor.instance.nowWindow === undefined) {
            if (event.keyCode === KeyCode.ALT_LEFT) {
                this.altHeld = true;
            } else if (event.keyCode === KeyCode.SHIFT_LEFT) {
                this.shiftHeld = true;
            } else if (event.keyCode === KeyCode.CTRL_LEFT) {
                this.ctrlHeld = true;
            } else if (event.keyCode === KeyCode.F1) {
                // F1 - 打开"资源"页面
                this.openMainMenuWindow(MainMenuOptionId.RESOURCE);
            } else if (event.keyCode === KeyCode.F2) {
                // F2 - 打开"编辑"页面
                this.openMainMenuWindow(MainMenuOptionId.EDIT);
            } else if (event.keyCode === KeyCode.F3) {
                // F3 - 打开"节点树"页面
                this.openMainMenuWindow(MainMenuOptionId.NODE_TREE);
            } else if (event.keyCode === KeyCode.F4) {
                // F4 - 打开"节点"页面
                this.openMainMenuWindow(MainMenuOptionId.NODE);
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
        if (Editor.instance.nowWindow === undefined) {
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
        const page = Editor.instance.nowPage as RoomEditPage;

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
            Editor.instance.objectShadow.setPosition(mouseX, mouseY);
        }
        return updated;
    }
}