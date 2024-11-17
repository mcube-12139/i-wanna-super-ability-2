import { _decorator, CCInteger, Component, EditBox, EventMouse, Node } from 'cc';
import { EditSceneController } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('GridSizeButtonController')
export class GridSizeButtonController extends Component {
    @property(CCInteger)
    size: number;
    @property(EditBox)
    sizeXInput: EditBox;
    @property(EditBox)
    sizeYInput: EditBox;

    start() {
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onMouseDown(e: EventMouse) {
        this.sizeXInput.string = this.size.toString();
        this.sizeYInput.string = this.size.toString();
        EditSceneController.setGridSize(this.size, this.size);
    }
}


