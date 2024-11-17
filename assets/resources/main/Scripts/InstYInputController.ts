import { _decorator, Component, EditBox, Node } from 'cc';
import { EditSceneController } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('InstYInputController')
export class InstYInputController extends Component {
    input: EditBox;
    initialText: string;

    start() {
        this.input = this.getComponent(EditBox);

        let flag = 0;
        let y: number;
        for (const object of EditSceneController.selectedObjects) {
            if (flag === 0) {
                y = object.y;
                flag = 1;
            } else if (flag === 1) {
                if (object.y !== y) {
                    flag = 2;
                    break;
                }
            }
        }
        if (flag === 1) {
            this.initialText = y.toString();
        } else if (flag === 2) {
            this.initialText = "...";
        }
        this.input.string = this.initialText;

        this.node.on("editing-did-ended", this.onEditEnd, this);
    }

    onEditEnd(input: EditBox) {
        const num = parseFloat(input.string);
        if (!isNaN(num)) {
            EditSceneController.setY(num);
        } else {
            input.string = this.initialText;
        }
    }
}


