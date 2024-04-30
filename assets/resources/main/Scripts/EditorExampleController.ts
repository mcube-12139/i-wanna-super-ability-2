import { _decorator, Component, Node, resources, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EditorExampleController')
export class EditorExampleController extends Component {
    exampleId: string;
    sprite: Sprite;

    onLoad() {
        this.sprite = this.node.getComponent(Sprite);
    }

    setSprite(name: string) {
        this.sprite.spriteFrame = resources.get(`main/Sprites/${name}/spriteFrame`);
    }
}


