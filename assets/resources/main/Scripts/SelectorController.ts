import { _decorator, Component, Graphics, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SelectorController')
export class SelectorController extends Component {
    graphics: Graphics;

    nodeId: string;
    width: number;
    height: number;

    start() {
        this.graphics = this.getComponent(Graphics);
        this.redraw();
    }

    redraw() {
        this.graphics.clear();
        this.graphics.rect(this.node.position.x, this.node.position.y, this.width, this.height);
        this.graphics.stroke();
    }
}


