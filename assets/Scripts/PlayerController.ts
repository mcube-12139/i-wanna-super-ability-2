import { _decorator, Component, EventMouse, Input, input, Node, Vec3, Animation, EventKeyboard, KeyCode, Sprite, view, macro } from 'cc';
import { Tag, TagId } from './Tag';
import { SweetCollider } from './SweetCollider';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass('PlayerController')
export class PlayerController extends Component {
    private anim: Animation = null;
    private collider: SweetCollider = null;

    private animName: string = "playerStand";

    private runningLeft: boolean = false;
    private runningRight: boolean = false;

    private speedX: number = 0;
    private speedY: number = 0;
    private gravity: number = 0.2777777777777778;
    private jumpSpeed: number = 7.027777777777778;
    private doubleJumpSpeed: number = 5.777777777777778;

    private doubleJumpEnabled = true;

    start() {
        this.anim = this.getComponent(Animation);
        this.collider = this.getComponent(SweetCollider);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.anim.play(this.animName);
    }

    update(_: number) {
        let newAnimName = this.animName;

        // 计算横移动方向
        let runDir = 0;
        if (this.runningLeft) {
            runDir = -1;
        } else if (this.runningRight) {
            runDir = 1;
        }

        if (runDir != 0) {
            // 有横移动
            this.node.setScale(runDir, this.node.scale.y);
            this.speedX = 2.5 * runDir;
        } else {
            // 无横移动
            this.speedX = 0;
        }

        if (!this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y - SweetGlobal.grav)) {
            if (this.speedY >= 0) {
                newAnimName = "playerJump";
            } else {
                newAnimName = "playerFall";
            }
        } else {
            if (runDir != 0) {
                newAnimName = "playerRun";
            } else {
                newAnimName = "playerStand";
            }
        }

        if (newAnimName != this.animName) {
            // 改变动画
            this.animName = newAnimName;
            this.anim.play(newAnimName);
        }

        // 改变位置
        this.speedY -= this.gravity;
        const previousX = this.node.position.x;
        const previousY = this.node.position.y;
        this.node.setPosition(previousX + this.speedX, previousY + this.speedY);
        // 处理碰撞固体
        if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y)) {
            this.node.setPosition(previousX, previousY);

            // 处理横向碰撞
            if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x + this.speedX, this.node.position.y)) {
                if (this.speedX >= 0) {
                    this.collider.moveContactWithTag(TagId.SOLID, 0, this.speedX);
                } else {
                    this.collider.moveContactWithTag(TagId.SOLID, 180, -this.speedX);
                }
                this.speedX = 0;
            }
            // 处理纵向碰撞
            if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y + this.speedY)) {
                if (this.speedY >= 0) {
                    this.collider.moveContactWithTag(TagId.SOLID, 90, this.speedY);
                    if (SweetGlobal.grav === -1) {
                        this.doubleJumpEnabled = true;
                    }
                } else {
                    this.collider.moveContactWithTag(TagId.SOLID, 270, -this.speedY);
                    if (SweetGlobal.grav === 1) {
                        this.doubleJumpEnabled = true;
                    }
                }
                this.speedY = 0;
            }
            // 处理斜向碰撞
            if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x + this.speedX, this.node.position.y + this.speedY)) {
                this.speedX = 0;
            }

            this.node.setPosition(this.node.position.x + this.speedX, this.node.position.y + this.speedY);
        }

        // 处理碰撞致死物
        if (this.collider.collideWithTag(TagId.DEADLY, this.node.position.x, this.node.position.y)) {
            this.node.setPosition(0, 40);
        }
    }

    jump() {
        if (this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y - SweetGlobal.grav)) {
            this.speedY = this.jumpSpeed;
            this.doubleJumpEnabled = true;
        } else if (this.doubleJumpEnabled) {
            this.speedY = this.doubleJumpSpeed;
            this.doubleJumpEnabled = false;
        }
    }

    releaseJump() {
        if (this.speedY * SweetGlobal.grav > 0) {
            this.speedY *= 0.45;
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT) {
            this.runningLeft = true;
        } else if (event.keyCode === KeyCode.ARROW_RIGHT) {
            this.runningRight = true;
        } else if (event.keyCode === KeyCode.SHIFT_LEFT) {
            this.jump();
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT) {
            this.runningLeft = false;
        } else if (event.keyCode === KeyCode.ARROW_RIGHT) {
            this.runningRight = false;
        } else if (event.keyCode === KeyCode.SHIFT_LEFT) {
            this.releaseJump();
        }
    }
}


