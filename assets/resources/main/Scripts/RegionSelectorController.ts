import { _decorator, Component, Graphics, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RegionSelectorController')
export class RegionSelectorController extends Component {
    graphics: Graphics;

    onLoad() {
        this.graphics = this.getComponent(Graphics);
    }

    setRegion(left: number, top: number, right: number, bottom: number) {
        this.node.setPosition(left, top);

        this.graphics.clear();
        this.graphics.rect(0, 0, right - left, bottom - top);
        this.graphics.fill();
        this.graphics.stroke();
    }
}


