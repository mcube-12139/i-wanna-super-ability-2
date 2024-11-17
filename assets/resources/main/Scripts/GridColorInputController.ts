import { _decorator, Color, Component, EditBox, Node } from 'cc';
import { EditData } from './Edit/EditData';
import { RoomEditPage } from './Edit/Page/RoomEditPage';
const { ccclass, property } = _decorator;

@ccclass('GridColorInputController')
export class GridColorInputController extends Component {
    start() {
        const page = EditData.instance.nowPage as RoomEditPage;
        this.node.on("editing-did-ended", this.onEditEnd, this);

        const input = this.getComponent(EditBox);
        input.string = page.data.gridColor.toHEX();
    }

    onEditEnd(input: EditBox) {
        const page = EditData.instance.nowPage as RoomEditPage;

        const colorStr = input.string;
        if (/^#[0-9a-fA-F]+$/.test(colorStr)) {
            const color = new Color();
            Color.fromHEX(color, colorStr);
            page.setGridColor(color);
        } else {
            input.string = page.data.gridColor.toHEX();
        }
    }
}


