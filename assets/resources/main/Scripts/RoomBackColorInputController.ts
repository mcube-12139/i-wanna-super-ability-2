import { _decorator, Component, EditBox, Node } from 'cc';
import { EditorData } from './EditorData';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('RoomBackColorInputController')
export class RoomBackColorInputController extends Component {
    start() {
        this.node.on("editing-did-ended", this.onEditEnd, this);

        const input = this.getComponent(EditBox);
        input.string = EditorData.nowRoomBackColor;
    }

    onEditEnd(input: EditBox) {
        const color = input.string;
        if (/^#[0-9a-fA-F]+$/.test(color)) {
            EditSceneController.instance.setBackColor(color);
        } else {
            input.string = EditorData.nowRoomBackColor;
        }
    }
}

