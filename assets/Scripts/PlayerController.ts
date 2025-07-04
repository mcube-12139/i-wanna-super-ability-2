import { _decorator, Component, Input, input, Animation, EventKeyboard, KeyCode, resources, instantiate, Prefab, director, AudioClip, AudioSource } from 'cc';
import { Tag, TagId } from './Tag';
import { SweetCollider } from './SweetCollider';
import { SweetGlobal } from './SweetGlobal';
import { PlatformControl } from './PlatformControl';
import { BulletController } from './BulletController';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(AudioClip)
    jumpClip!: AudioClip;
    @property(AudioClip)
    doubleJumpClip!: AudioClip;
    @property(AudioClip)
    dieClip!: AudioClip;
    @property(AudioClip)
    shootClip!: AudioClip;

    anim!: Animation;
    collider!: SweetCollider;
    audioSource!: AudioSource;

    private animName: string = "playerStand";

    private runningLeft: boolean = false;
    private runningRight: boolean = false;

    private onPlatform: boolean = false;

    speedX: number = 0;
    speedY: number = 0;
    private gravity: number = 0.2777777777777778;
    private jumpSpeed: number = 7.027777777777778;
    private doubleJumpSpeed: number = 5.777777777777778;
    private maxFallSpeed: number = 7.555555555555555;

    private doubleJumpEnabled = true;

    start() {
        this.anim = this.getComponent(Animation)!;
        this.collider = this.getComponent(SweetCollider)!;
        this.audioSource = this.getComponent(AudioSource)!;

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.anim.play(this.animName);

        if (SweetGlobal.loaded) {
            // 从存档中读取状态
            SweetGlobal.loaded = false;
            this.node.setPosition(SweetGlobal.savedData.playerX, SweetGlobal.savedData.playerY);
            this.node.setScale(SweetGlobal.savedData.playerScaleX, SweetGlobal.savedData.grav);
        }
        if (SweetGlobal.autosave) {
            // 自动存档
            SweetGlobal.autosave = false;
            SweetGlobal.save();
        }
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

        if (runDir !== 0) {
            // 有横移动
            this.node.setScale(runDir, this.node.scale.y);
            this.speedX = 2.5 * runDir;
        } else {
            // 无横移动
            this.speedX = 0;
        }

        // 更新在平板上状态
        if (this.onPlatform) {
            if (!this.collider.collideWithTag(TagId.PLATFORM, this.node.position.x, this.node.position.y - 4 * SweetGlobal.grav)) {
                this.onPlatform = false;
            }
        }

        // 限制下落速度
        if (this.speedY * SweetGlobal.grav < -this.maxFallSpeed) {
            this.speedY = -SweetGlobal.grav * this.maxFallSpeed;
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

            // 修正后重新移动
            this.node.setPosition(this.node.position.x + this.speedX, this.node.position.y + this.speedY);
        }

        // 处理碰撞平板
        for (const platform of this.collider.iterCollidedWithTag(TagId.PLATFORM, this.node.position.x, this.node.position.y)) {
            const platCollider = platform.getComponent(SweetCollider)!;
            const platCtrl = platform.getComponent(PlatformControl)!;
            if (SweetGlobal.grav === 1) {
                // 正常
                const otherTop = platform.position.y + platCollider.top;
                if (this.node.position.y - this.speedY / 2 >= otherTop) {
                    this.node.setPosition(this.node.position.x, otherTop + 9);
                    this.speedY = platCtrl.movement.speedY < 0 ? platCtrl.movement.speedY : 0;
                    this.onPlatform = true;
                    this.doubleJumpEnabled = true;
                }
            } else {
                // 翻转
                const otherBottom = platform.position.y + platCollider.bottom;
                if (this.node.position.y - this.speedY / 2 <= otherBottom + 1) {
                    this.node.setPosition(this.node.position.x, otherBottom - 9);
                    this.speedY = platCtrl.movement.speedY > 0 ? platCtrl.movement.speedY : 0;
                    this.onPlatform = true;
                    this.doubleJumpEnabled = true;
                }
            }
        }

        // 处理碰撞致死物
        if (this.collider.collideWithTag(TagId.DEADLY, this.node.position.x, this.node.position.y)) {
            this.audioSource.playOneShot(this.dieClip);
            this.node.destroy();
        }

        // 处理动画改变
        if (!this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y - SweetGlobal.grav) && !this.onPlatform) {
            if (this.speedY >= 0) {
                newAnimName = "playerJump";
            } else {
                newAnimName = "playerFall";
            }
        } else {
            if (runDir !== 0) {
                newAnimName = "playerRun";
            } else {
                newAnimName = "playerStand";
            }
        }

        if (newAnimName !== this.animName) {
            this.animName = newAnimName;
            this.anim.play(newAnimName);
        }
    }

    jump() {
        if (
            this.collider.collideWithTag(TagId.SOLID, this.node.position.x, this.node.position.y - SweetGlobal.grav) ||
            this.collider.collideWithTag(TagId.PLATFORM, this.node.position.x, this.node.position.y - SweetGlobal.grav) ||
            this.onPlatform
        ) {
            // 一段跳
            this.speedY = this.jumpSpeed;
            this.doubleJumpEnabled = true;
            this.audioSource.playOneShot(this.jumpClip);
        } else if (this.doubleJumpEnabled) {
            // 二段跳
            this.speedY = this.doubleJumpSpeed;
            this.doubleJumpEnabled = false;
            this.audioSource.playOneShot(this.doubleJumpClip);
        }
    }

    releaseJump() {
        if (this.speedY * SweetGlobal.grav > 0) {
            this.speedY *= 0.45;
        }
    }

    shoot() {
        if (Tag.getNodeCount(TagId.BULLET) < 4) {
            // 子弹数小于4，射击
            const bullet = instantiate(SweetGlobal.bulletPrefab);
            const bulletCtrl = bullet.getComponent(BulletController)!;
            bullet.setPosition(this.node.position.x, this.node.position.y);
            console.log(bulletCtrl);
            bulletCtrl.movement.speedX = this.node.scale.x * 13.333333333333334;

            SweetGlobal.gameScene.playerContainer.addChild(bullet);

            this.audioSource.playOneShot(this.shootClip);
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT) {
            this.runningLeft = true;
        } else if (event.keyCode === KeyCode.ARROW_RIGHT) {
            this.runningRight = true;
        } else if (event.keyCode === KeyCode.SHIFT_LEFT) {
            this.jump();
        } else if (event.keyCode === KeyCode.KEY_Z) {
            this.shoot();
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


