import { _decorator, Component, Label, math, Node, Sprite } from 'cc';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

export class RoomListItemData {
    name: string;
    editTime: string;
    constructor(name: string, editTime: string) {
        this.name = name;
        this.editTime = editTime;
    }
}

@ccclass('RoomListItemController')
export class RoomListItemController extends Component {
    @property(Sprite)
    backSprite: Sprite;
    @property(Label)
    nameLabel: Label;
    @property(Label)
    editTimeLabel: Label;

    roomName: string;
    selected: boolean;

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    onMouseEnter(_) {
        this.backSprite.enabled = true;
    }

    onMouseLeave(_) {
        if (!this.selected) {
            this.backSprite.enabled = false;
        }
    }

    onMouseUp(_) {
        if (!this.selected) {
            EditSceneController.instance.closeWindow();
            EditSceneController.loadRoom(this.roomName);
        }
    }

    setData(data: RoomListItemData, selected: boolean) {
        this.roomName = data.name;
        this.nameLabel.string = data.name;
        this.editTimeLabel.string = data.editTime;
        this.selected = selected;

        if (selected) {
            this.backSprite.enabled = true;
        }
    }
}


