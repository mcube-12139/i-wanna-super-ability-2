import { _decorator, CCBoolean, CCFloat, Component } from 'cc';
import { SweetCollider } from './SweetCollider';
import { Tag, TagId } from './Tag';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('PlatformController')
export class PlatformController extends Component {
    @property(CCFloat)
    speedX: number = 0;
    @property(CCFloat)
    speedY: number = 0;
    @property(CCBoolean)
    bounce: boolean = true;

    private collider: SweetCollider;
    
    start() {
        this.collider = this.getComponent(SweetCollider);
    }

    update(_: number) {
        if (this.speedX !== 0 || this.speedY !== 0) {
            if (this.bounce) {
                if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x + this.speedX, this.node.position.y)) {
                    this.speedX = -this.speedX;
                }
                if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y + this.speedY)) {
                    this.speedY = -this.speedY;
                }
            }
            for (const player of this.collider.iterCollidedWithTag(TagId.PLAYER, this.node.position.x, this.node.position.y + 2 * SweetGlobal.grav)) {
                const playerCollider = player.getComponent(SweetCollider);
                
                playerCollider.moveContactWithTag(TagId.SOLID, this.speedY > 0 ? 90 : 270, Math.abs(this.speedY));
                playerCollider.moveContactWithTag(TagId.SOLID, this.speedX > 0 ? 0 : 180, Math.abs(this.speedX));
            }
        }

        this.node.setPosition(this.node.position.x + this.speedX, this.node.position.y + this.speedY);
    }
}


