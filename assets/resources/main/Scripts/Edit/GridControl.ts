import { _decorator, Component, Graphics, math } from 'cc';
import { Editor } from './Editor';
import { RoomEditPage } from './Page/RoomEditPage';
const { ccclass, property } = _decorator;

@ccclass('GridController')
export class GridControl extends Component {
    graphics!: Graphics;

    onLoad() {
        this.graphics = this.node.getComponent(Graphics)!;
    }

    redraw() {
        const page = Editor.instance.nowPage as RoomEditPage;

        if (page.gridVisible) {
            this.graphics.enabled = true;
            this.graphics.fillColor = new math.Color(page.gridColor);
            this.graphics.clear();
            for (let i = 0; i < 800; i += page.gridSize.x) {
                this.graphics.rect(i, 0, 1, 450);
            }
            for (let j = 0; j < 450; j += page.gridSize.y) {
                this.graphics.rect(0, j, 800, 1);
            }
            this.graphics.fill();
        } else {
            this.graphics.enabled = false;
        }
    }
}