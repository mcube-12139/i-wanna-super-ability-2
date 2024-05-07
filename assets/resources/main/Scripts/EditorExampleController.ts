import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass } = _decorator;

@ccclass('EditorExampleController')
export class EditorExampleController extends Component {
    sprite: Sprite;

    onLoad() {
        this.sprite = this.getComponent(Sprite);
    }

    setSprite(sprite: SpriteFrame) {
        this.sprite.spriteFrame = sprite;
    }
}


