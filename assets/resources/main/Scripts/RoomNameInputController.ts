import { _decorator, Component, EditBox, Label, Node } from 'cc';
import { EditSceneController } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('RoomNameInputController')
export class RoomNameInputController extends Component {
    @property(Label)
    errorLabel: Label;

    start() {
        const editBox = this.getComponent(EditBox);
        editBox.string = EditSceneController.nowRoomMetadata.name;

        this.node.on("editing-did-ended", this.onEditEnd, this);
    }

    onEditEnd(editBox: EditBox) {
        const name = editBox.textLabel.string;
        if (name !== EditSceneController.nowRoomMetadata.name) {
            const result = EditSceneController.renameRoom(name);
            if (!result.ok) {
                editBox.string = EditSceneController.nowRoomMetadata.name;
                this.errorLabel.string = result.error;
            }
        }
    }
}


