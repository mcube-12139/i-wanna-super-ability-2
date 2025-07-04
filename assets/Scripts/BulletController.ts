import { _decorator, Component, Node } from 'cc';
import { SweetCollider } from './SweetCollider';
import { TagId } from './Tag';
import { Movement } from './Movement';
const { ccclass, property } = _decorator;

@ccclass('BulletController')
export class BulletController extends Component {
    @property(Movement)
    movement!: Movement;
    @property(SweetCollider)
    collider!: SweetCollider;

    public speedX: number = 0;
    public speedY: number = 0;

    start() {
    }

    update(_: number) {
        this.node.setPosition(this.node.position.x + this.speedX, this.node.position.y + this.speedY);
        if (this.node.position.x < -400 || this.node.position.x >= 400 || this.node.position.y < -225 || this.node.position.y >= 225) {
            this.node.destroy();
        }
        if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y)) {
            this.node.destroy();
        }
    }
}


