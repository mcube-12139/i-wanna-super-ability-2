import { _decorator, Component, Graphics } from 'cc';
import { EditorData } from './EditorData';
const { ccclass, property } = _decorator;

@ccclass('GridController')
export class GridController extends Component {
    graphics: Graphics;

    onLoad() {
        this.graphics = this.node.getComponent(Graphics);
    }

    redraw() {
        if (EditorData.gridVisible) {
            this.graphics.enabled = true;
            this.graphics.fillColor = EditorData.gridColor;
            for (let i = 0; i < 800; i += EditorData.gridWidth) {
                this.graphics.rect(i, 0, 1, 450);
            }
            for (let j = 0; j < 450; j += EditorData.gridHeight) {
                this.graphics.rect(0, j, 800, 1);
            }
            this.graphics.fill();
        } else {
            this.graphics.enabled = false;
        }
    }
}