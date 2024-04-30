import { _decorator, CCInteger, Component, EditBox, Node } from 'cc';
import { EditorData } from './EditorData';
const { ccclass, property } = _decorator;

@ccclass('RoomSizeInputController')
export class RoomSizeInputController extends Component {
    @property(CCInteger)
    index: number;

    start() {
        const editBox = this.getComponent(EditBox);
        if (this.index === 0) {
            editBox.string = EditorData.nowRoomWidth.toString();
        } else {
            editBox.string = EditorData.nowRoomHeight.toString();
        }

        this.node.on("editing-did-ended", this.onEditEnd, this);
    }

    onEditEnd(editBox: EditBox) {
        const num = parseInt(editBox.textLabel.string);
        if (!isNaN(num) && num > 0) {
            if (this.index === 0) {
                EditorData.nowRoomWidth = num;
            } else {
                EditorData.nowRoomHeight = num;
            }
        }
    }
}


