import { _decorator, Color, Component, EditBox, Node, Toggle, Vec2 } from 'cc';
import { ButtonController } from '../ButtonController';
import { EditData } from './EditData';
import { RoomEditPage } from './Page/RoomEditPage';
const { ccclass, property } = _decorator;

@ccclass('EditPageControl')
export class EditPageControl extends Component {
    @property(Toggle)
    gridVisible!: Toggle;
    @property(EditBox)
    gridSizeInputX!: EditBox;
    @property(EditBox)
    gridSizeInputY!: EditBox;
    @property(ButtonController)
    gridSizeButton32!: ButtonController;
    @property(ButtonController)
    gridSizeButton16!: ButtonController;
    @property(ButtonController)
    gridSizeButton8!: ButtonController;
    @property(ButtonController)
    gridSizeButton4!: ButtonController;
    @property(EditBox)
    gridColor!: EditBox;

    start() {
        const page = EditData.instance.nowPage as RoomEditPage;

        this.gridVisible.isChecked = page.gridVisible;
        this.gridVisible.node.on("toggle", (toggle: Toggle) => {
            page.setGridVisible(toggle.isChecked);
        }, this);

        this.gridSizeInputX.string = page.gridSize.x.toString();
        this.gridSizeInputX.node.on("editing-did-ended", (editBox: EditBox) => {
            const newValue = parseInt(editBox.string, 10);

            if (!isNaN(newValue) && newValue > 1) {
                page.setGridSize(new Vec2(newValue, page.gridSize.y));
            } else {
                editBox.string = page.gridSize.x.toString();
            }
        }, this);

        this.gridSizeInputY.string = page.gridSize.y.toString();
        this.gridSizeInputY.node.on("editing-did-ended", (editBox: EditBox) => {
            const newValue = parseInt(editBox.string, 10);

            if (!isNaN(newValue) && newValue > 1) {
                page.setGridSize(new Vec2(page.gridSize.x, newValue));
            } else {
                editBox.string = page.gridSize.y.toString();
            }
        }, this);

        this.gridSizeButton32.onTouchEnd(this.getSizeButtonFun(32));
        this.gridSizeButton16.onTouchEnd(this.getSizeButtonFun(16));
        this.gridSizeButton8.onTouchEnd(this.getSizeButtonFun(8));
        this.gridSizeButton4.onTouchEnd(this.getSizeButtonFun(4));

        this.gridColor.string = page.gridColor.toHEX("#rrggbbaa");
        this.gridColor.node.on("editing-did-ended", (editBox: EditBox) => {
            if (/^[0-9a-fA-F]{8}$/.test(editBox.string)) {
                const color = new Color().fromHEX(editBox.string);
                page.setGridColor(color);
            }
        });
    }

    getSizeButtonFun(size: number): (event: TouchEvent) => void {
        return (event: TouchEvent) => {
            const page = EditData.instance.nowPage as RoomEditPage;

            this.gridSizeInputX.string = size.toString();
            this.gridSizeInputY.string = size.toString();
            page.setGridSize(new Vec2(size, size));
        };
    }
}


