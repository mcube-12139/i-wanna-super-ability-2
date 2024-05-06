import { _decorator, CCFloat, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Movement')
export class Movement extends Component {
    @property(CCFloat)
    speedX: number = 0;
    @property(CCFloat)
    speedY: number = 0;

    start() {
        
    }

    update(_: number) {
        this.node.setPosition(this.node.position.x + this.speedX, this.node.position.y + this.speedY);
    }
}


