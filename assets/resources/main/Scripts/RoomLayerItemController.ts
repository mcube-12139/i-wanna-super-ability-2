import { _decorator, Component, EditBox, EventMouse, Label, Node, ScrollView, Sprite } from 'cc';
import { RoomLayerListController } from './RoomLayerListController';
import { EditSceneController, LayerData } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('RoomLayerItemController')
export class RoomLayerItemController extends Component {
    @property(Sprite)
    background: Sprite;
    @property(Label)
    nameLabel: Label;
    @property(EditBox)
    nameInput: EditBox;

    data: LayerData;
    listControl: RoomLayerListController;

    start() {
        this.listControl = this.node.parent.getComponent(RoomLayerListController);

        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);

        this.nameInput.node.on("editing-did-ended", this.onNameEditEnd, this);
    }

    setData(data: LayerData) {
        this.data = data;

        this.nameLabel.string = data.name;
    }

    editName() {
        const view = this.node.parent.parent.parent.getComponent(ScrollView);
        this.nameInput.enabled = true;
        this.nameInput.string = this.data.name;
        this.nameLabel.enabled = false;
        this.nameInput.focus();
    }

    doDelete() {
        EditSceneController.deleteLayer(this.data);
    }

    doMoveUp() {
        EditSceneController.moveUpLayer(this.data);
    }

    doMoveDown() {
        EditSceneController.moveDownLayer(this.data);
    }

    onMouseEnter(e: EventMouse) {
        this.background.enabled = true;
    }

    onMouseLeave(e: EventMouse) {
        if (this.listControl.selectedItem !== this) {
            this.background.enabled = false;
        }
    }

    onMouseUp(e: EventMouse) {
        this.listControl.selectItem(this);
    }

    onNameEditEnd(editBox: EditBox) {
        this.nameLabel.enabled = true;
        const newName = editBox.textLabel.string;
        const result = EditSceneController.renameLayer(this.data, newName);
        if (result.ok) {
            this.nameLabel.string = newName;
        }
        this.nameInput.string = "";
        this.nameInput.enabled = false;
    }
}


