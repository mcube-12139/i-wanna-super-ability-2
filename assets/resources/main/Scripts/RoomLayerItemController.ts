import { _decorator, Component, EditBox, EventMouse, Label, Node, ScrollView, Sprite } from 'cc';
import { RoomLayerListController } from './RoomLayerListController';
import { EditorData } from './EditorData';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('RoomLayerItemController')
export class RoomLayerItemController extends Component {
    @property(Sprite)
    background: Sprite;
    @property(Label)
    nameLabel: Label;
    @property(EditBox)
    nameInput: EditBox;

    index: number;
    layerName: string;
    listControl: RoomLayerListController;

    start() {
        this.listControl = this.node.parent.getComponent(RoomLayerListController);

        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);

        this.nameInput.node.on("editing-did-ended", this.onNameEditEnd, this);
    }

    setData(index: number, name: string) {
        this.index = index;
        this.layerName = name;

        this.nameLabel.string = name;
    }

    editName() {
        const view = this.node.parent.parent.parent.getComponent(ScrollView);
        this.nameInput.enabled = true;
        this.nameInput.string = this.layerName;
        this.nameLabel.enabled = false;
        this.nameInput.focus();
    }

    doDelete() {
        EditSceneController.instance.deleteLayer(this.layerName);
    }

    doMoveUp() {
        EditSceneController.instance.moveUpLayer(this.layerName);
    }

    doMoveDown() {
        EditSceneController.instance.moveDownLayer(this.layerName);
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
        this.listControl.selectItem(this.index);
    }

    onNameEditEnd(editBox: EditBox) {
        this.nameLabel.enabled = true;
        const newName = editBox.textLabel.string;
        const result = EditSceneController.instance.renameLayer(this.layerName, newName);
        if (result.ok) {
            this.layerName = newName;
            this.nameLabel.string = newName;
        }
        this.nameInput.string = "";
        this.nameInput.enabled = false;
    }
}


