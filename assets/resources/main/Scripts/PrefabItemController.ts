import { _decorator, Component, Label, Node, resources, Sprite } from 'cc';
import { EditPrefab } from './Edit/EditPrefab';
import { EditSceneController } from './Edit/Editor';
const { ccclass, property } = _decorator;

@ccclass('PrefabItemController')
export class PrefabItemController extends Component {
    @property(Sprite)
    backSprite: Sprite;
    @property(Sprite)
    sprite: Sprite;
    @property(Label)
    label: Label;

    selected: boolean;
    data: EditPrefab;

    onLoad() {
        this.selected = false;

        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    setData(data: EditPrefab) {
        this.data = data;
        if (data === EditSceneController.nowPrefabData) {
            this.selected = true;
            this.backSprite.enabled = true;
        }
        this.sprite.spriteFrame = data.sprite;
        this.label.string = data.name;
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
        EditSceneController.selectPrefab(this.data);
        EditSceneController.instance.closeWindow();
    }
}


