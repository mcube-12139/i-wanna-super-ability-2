import { _decorator, Component, Label, math, Node, Sprite } from 'cc';
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

    onLoad() {
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    onMouseEnter(_) {
        this.backSprite.enabled = true;
    }

    onMouseLeave(_) {
        this.backSprite.enabled = false;
    }

    setData(data: RoomListItemData) {
        this.nameLabel.string = data.name;
        this.editTimeLabel.string = data.editTime;
    }
}


