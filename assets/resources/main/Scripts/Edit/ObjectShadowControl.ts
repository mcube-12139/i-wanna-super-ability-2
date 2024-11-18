import { _decorator, Component, resources, Sprite, UITransform } from 'cc';
import { EditPrefab } from './EditPrefab';
const { ccclass, property } = _decorator;

@ccclass('ObjectShadowControl')
export class ObjectShadowControl extends Component {
    sprite!: Sprite;
    transform!: UITransform;

    onLoad() {
        this.sprite = this.node.getComponent(Sprite)!;
        this.transform = this.node.getComponent(UITransform)!;
    }
    
    enable() {
        this.sprite.enabled = true;
    }

    disable() {
        this.sprite.enabled = false;
    }

    setPrefab(prefab: EditPrefab) {
        this.sprite.spriteFrame = prefab.sprite;
    }
}


