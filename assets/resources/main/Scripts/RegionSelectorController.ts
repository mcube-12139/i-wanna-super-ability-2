import { _decorator, Component, Graphics, Node, Rect } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RegionSelectorController')
export class RegionSelectorController extends Component {
    graphics: Graphics;

    onLoad() {
        this.graphics = this.getComponent(Graphics);
    }

    setRegion(rect: Rect) {
        this.node.setPosition(rect.x, rect.y);

        this.graphics.clear();
        this.graphics.rect(0, 0, rect.width, rect.height);
        this.graphics.fill();
        this.graphics.stroke();
    }
}


