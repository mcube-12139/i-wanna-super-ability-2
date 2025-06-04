import { _decorator, CCInteger, Component, EditBox, Node } from 'cc';
import { EditSceneController } from './Edit/Editor';
const { ccclass, property } = _decorator;

@ccclass('RoomSizeInputController')
export class RoomSizeInputController extends Component {
    @property(CCInteger)
    index: number;

    start() {
        const editBox = this.getComponent(EditBox);
        if (this.index === 0) {
            editBox.string = EditSceneController.nowRoomWidth.toString();
        } else {
            editBox.string = EditSceneController.nowRoomHeight.toString();
        }

        this.node.on("editing-did-ended", this.onEditEnd, this);
    }

    onEditEnd(editBox: EditBox) {
        const num = parseInt(editBox.textLabel.string);
        if (!isNaN(num) && num > 0) {
            if (this.index === 0) {
                EditSceneController.nowRoomWidth = num;
            } else {
                EditSceneController.nowRoomHeight = num;
            }
        }
    }
}


