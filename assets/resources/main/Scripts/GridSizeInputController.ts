import { _decorator, CCInteger, Component, EditBox, Node } from 'cc';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('GridSizeInputController')
export class GridSizeInputController extends Component {
    @property(CCInteger)
    index: number;

    start() {
        const editbox = this.getComponent(EditBox);
        if (this.index === 0) {
            editbox.string = EditSceneController.gridWidth.toString();
        } else {
            editbox.string = EditSceneController.gridHeight.toString();
        }

        this.node.on("editing-did-ended", this.onEditEnd, this);
    }

    onEditEnd(editbox: EditBox) {
        const num = parseInt(editbox.textLabel.string);
        if (!isNaN(num) && num !== 0) {
            if (this.index === 0) {
                EditSceneController.instance.setGridSize(num, EditSceneController.gridHeight);
            } else {
                EditSceneController.instance.setGridSize(EditSceneController.gridWidth, num);
            }
        }
    }
}


