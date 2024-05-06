import { _decorator, Component, EditBox, Node } from 'cc';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('GridColorInputController')
export class GridColorInputController extends Component {
    start() {
        this.node.on("editing-did-ended", this.onEditEnd, this);

        const input = this.getComponent(EditBox);
        input.string = EditSceneController.gridColor;
    }

    onEditEnd(input: EditBox) {
        const color = input.string;
        if (/^#[0-9a-fA-F]+$/.test(color)) {
            EditSceneController.instance.setGridColor(color);
        } else {
            input.string = EditSceneController.gridColor;
        }
    }
}


