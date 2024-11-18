import { _decorator, Button, Component, EditBox, Label } from 'cc';
import { EditData } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('CreateRoomButtonController')
export class CreateRoomButtonController extends Component {
    @property(EditBox)
    roomNameInput!: EditBox;
    @property(Label)
    illegalLabel!: Label;

    onLoad() {
        this.node.on(Button.EventType.CLICK, this.onClick, this);
    }

    onClick(_: Button) {
        const roomName = this.roomNameInput.textLabel!.string;
        if (roomName === "") {
            this.illegalLabel.string = "房间名不能是空";
        } else {
            const result = EditData.instance.createRoom(roomName);
            if (result.ok) {
                EditData.instance.closeWindow();
            } else {
                this.illegalLabel.string = result.error!;
            }
        }
    }
}


