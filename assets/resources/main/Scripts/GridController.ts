import { _decorator, Component, Graphics, math } from 'cc';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('GridController')
export class GridController extends Component {
    graphics: Graphics;

    onLoad() {
        this.graphics = this.node.getComponent(Graphics);
    }

    redraw() {
        if (EditSceneController.gridVisible) {
            this.graphics.enabled = true;
            this.graphics.fillColor = new math.Color(EditSceneController.gridColor);
            this.graphics.clear();
            for (let i = 0; i < 800; i += EditSceneController.gridWidth) {
                this.graphics.rect(i, 0, 1, 450);
            }
            for (let j = 0; j < 450; j += EditSceneController.gridHeight) {
                this.graphics.rect(0, j, 800, 1);
            }
            this.graphics.fill();
        } else {
            this.graphics.enabled = false;
        }
    }
}