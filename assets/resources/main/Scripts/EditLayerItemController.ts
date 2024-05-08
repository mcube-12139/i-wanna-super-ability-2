import { _decorator, Component, EventMouse, Label, Node, Sprite, Toggle } from 'cc';
import { EditSceneController } from './EditSceneController';
import { LayerData } from './LayerData';
const { ccclass, property } = _decorator;

@ccclass('EditLayerItemController')
export class EditLayerItemController extends Component {
    @property(Sprite)
    background: Sprite;
    @property(Label)
    nameLabel: Label;
    @property(Toggle)
    visible: Toggle;
    @property(Toggle)
    locked: Toggle;

    selected: boolean;
    data: LayerData;

    start() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);

        this.visible.node.on("toggle", this.onVisibleToggle, this);
        this.locked.node.on("toggle", this.onLockedToggle, this);
    }

    setData(data: LayerData) {
        this.selected = EditSceneController.nowLayerData === data;
        if (this.selected) {
            this.background.enabled = true;
        }
        this.data = data;
        this.nameLabel.string = data.name;
        this.visible.isChecked = data.visible;
        this.locked.isChecked = data.locked;
    }

    onMouseEnter(e: EventMouse) {
        this.background.enabled = true;
    }

    onMouseLeave(e: EventMouse) {
        if (!this.selected) {
            this.background.enabled = false;
        }
    }

    onMouseUp(e: EventMouse) {
        for (const child of this.node.parent.children) {
            if (child !== this.node) {
                const controller = child.getComponent(EditLayerItemController);
                if (controller.selected) {
                    controller.selected = false;
                    controller.background.enabled = false;
                    break;
                }
            }
        }
        this.selected = true;
        this.background.enabled = true;
        EditSceneController.selectLayer(this.data);
    }

    onVisibleToggle(toggle: Toggle) {
        this.data.setVisible(toggle.isChecked);
    }

    onLockedToggle(toggle: Toggle) {
        this.data.locked = toggle.isChecked;
    }
}


