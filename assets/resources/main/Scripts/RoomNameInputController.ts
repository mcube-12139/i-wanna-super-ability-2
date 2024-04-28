import { _decorator, Component, EditBox, Label, Node } from 'cc';
import { EditorData } from './EditorData';
const { ccclass, property } = _decorator;

@ccclass('RoomNameInputController')
export class RoomNameInputController extends Component {
    @property(Label)
    errorLabel: Label;

    start() {
        const editBox = this.getComponent(EditBox);
        editBox.string = EditorData.nowRoomMetadata.name;

        this.node.on("editing-did-ended", this.onEditEnd, this);
    }

    onEditEnd(editBox: EditBox) {
        const name = editBox.textLabel.string;
        const result = EditorData.renameRoom(name);
        if (!result.ok) {
            editBox.string = EditorData.nowRoomMetadata.name;
            this.errorLabel.string = result.error;
        }
    }
}


