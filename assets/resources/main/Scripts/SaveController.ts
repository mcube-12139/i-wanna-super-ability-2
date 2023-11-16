import { _decorator, AudioClip, AudioSource, Color, Component, Node, Sprite, SpriteFrame } from 'cc';
import { SweetCollider } from './SweetCollider';
import { TagId } from './Tag';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('SaveController')
export class SaveController extends Component {
    @property(SpriteFrame)
    normalFrame: SpriteFrame = null;
    @property(SpriteFrame)
    savedFrame: SpriteFrame = null;
    @property(AudioClip)
    sound: AudioClip = null;

    private sprite: Sprite = null;
    private collider: SweetCollider = null;
    private audioSource: AudioSource = null;

    // 冷却
    private cool = true;
    private coolTimer = -1;

    private meetPlayer = false;

    private resetFrameTimer = -1;

    start() {
        this.sprite = this.getComponent(Sprite);
        this.collider = this.getComponent(SweetCollider);
        this.audioSource = this.getComponent(AudioSource);
    }

    update(_: number) {
        if (this.coolTimer >= 0) {
            --this.coolTimer;
            if (this.coolTimer === 0) {
                this.cool = true;
            }
        }
        
        if (this.resetFrameTimer >= 0) {
            --this.resetFrameTimer;
            if (this.resetFrameTimer === 0) {
                this.sprite.spriteFrame = this.normalFrame;
            }
        }

        // 根据是否碰撞玩家，设置标志，改变透明度
        if (this.collider.collideWithTag(TagId.PLAYER, this.node.position.x, this.node.position.y)) {
            this.meetPlayer = true;
            const alpha = this.sprite.color.a + 10;
            this.sprite.color = new Color(this.sprite.color.r, this.sprite.color.g, this.sprite.color.b, alpha < 255 ? alpha : 255);
        } else {
            this.meetPlayer = false;
            const alpha = this.sprite.color.a - 10;
            this.sprite.color = new Color(this.sprite.color.r, this.sprite.color.g, this.sprite.color.b, alpha > 128 ? alpha : 128);
        }

        if (this.cool && this.meetPlayer) {
            if (this.collider.collideWithTag(TagId.BULLET, this.node.position.x, this.node.position.y)) {
                this.cool = false;

                this.sprite.spriteFrame = this.savedFrame;
                this.coolTimer = 30;
                this.resetFrameTimer = 60;
                this.audioSource.playOneShot(this.sound);

                SweetGlobal.save();
            }
        }
    }
}


