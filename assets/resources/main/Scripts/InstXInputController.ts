import { _decorator, Component, EditBox, Node } from 'cc';
import { EditSceneController } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('InstXInputController')
export class InstXInputController extends Component {
    input: EditBox;
    initialText: string;

    start() {
        this.input = this.getComponent(EditBox);

        let flag = 0;
        let x: number;
        for (const object of EditSceneController.selectedObjects) {
            if (flag === 0) {
                x = object.x;
                flag = 1;
            } else if (flag === 1) {
                if (object.x !== x) {
                    flag = 2;
                    break;
                }
            }
        }
        if (flag === 1) {
            this.initialText = x.toString();
        } else if (flag === 2) {
            this.initialText = "...";
        }
        this.input.string = this.initialText;

        this.node.on("editing-did-ended", this.onEditEnd, this);
    }

    onEditEnd(input: EditBox) {
        const num = parseFloat(input.string);
        if (!isNaN(num)) {
            EditSceneController.setX(num);
        } else {
            input.string = this.initialText;
        }
    }
}


