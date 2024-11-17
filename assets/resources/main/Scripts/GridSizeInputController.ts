import { _decorator, CCInteger, Component, EditBox, Node, Vec2 } from 'cc';
import { EditData } from './Edit/EditData';
import { RoomEditPage } from './Edit/Page/RoomEditPage';
const { ccclass, property } = _decorator;

@ccclass('GridSizeInputController')
export class GridSizeInputController extends Component {
    @property(CCInteger)
    index: number;

    start() {
        const page = EditData.instance.nowPage as RoomEditPage;

        const editbox = this.getComponent(EditBox);
        if (this.index === 0) {
            editbox.string = page.data.gridSize.x.toString();
        } else {
            editbox.string = page.data.gridSize.y.toString();
        }

        this.node.on("editing-did-ended", this.onEditEnd, this);
    }

    onEditEnd(editbox: EditBox) {
        const page = EditData.instance.nowPage as RoomEditPage;

        const num = parseInt(editbox.textLabel.string);
        if (!isNaN(num) && num !== 0) {
            if (this.index === 0) {
                page.setGridSize(new Vec2(num, page.data.gridSize.y));
            } else {
                page.setGridSize(new Vec2(page.data.gridSize.x, num));
            }
        }
    }
}


