import { _decorator, CCInteger, Component, EditBox, EventMouse, Node, Vec2 } from 'cc';
import { EditData } from './Edit/EditData';
import { RoomEditPage } from './Edit/Page/RoomEditPage';
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
        const page = EditData.instance.nowPage as RoomEditPage;

        this.sizeXInput.string = this.size.toString();
        this.sizeYInput.string = this.size.toString();
        page.setGridSize(new Vec2(this.size, this.size));
    }
}


