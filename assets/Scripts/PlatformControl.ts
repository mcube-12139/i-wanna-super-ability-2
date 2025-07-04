import { _decorator, CCBoolean, CCFloat, Component } from 'cc';
import { SweetCollider } from './SweetCollider';
import { Tag, TagId } from './Tag';
import { SweetGlobal } from './SweetGlobal';
import { Movement } from './Movement';
const { ccclass, property } = _decorator;

@ccclass('PlatformControl')
export class PlatformControl extends Component {
    @property(Movement)
    movement!: Movement;
    @property(SweetCollider)
    collider!: SweetCollider;

    @property(CCBoolean)
    bounce: boolean = true;
    
    start() {
    }

    update(_: number) {
        if (this.movement.speedX !== 0 || this.movement.speedY !== 0) {
            if (this.bounce) {
                if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x + this.movement.speedX, this.node.position.y)) {
                    this.movement.speedX = -this.movement.speedX;
                }
                if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y + this.movement.speedY)) {
                    this.movement.speedY = -this.movement.speedY;
                }
            }
            for (const player of this.collider.iterCollidedWithTag(TagId.PLAYER, this.node.position.x, this.node.position.y + 2 * SweetGlobal.grav)) {
                const playerCollider = player.getComponent(SweetCollider)!;
                
                playerCollider.moveContactWithTag(TagId.SOLID, this.movement.speedY > 0 ? 90 : 270, Math.abs(this.movement.speedY));
                playerCollider.moveContactWithTag(TagId.SOLID, this.movement.speedX > 0 ? 0 : 180, Math.abs(this.movement.speedX));
            }
        }
    }
}


