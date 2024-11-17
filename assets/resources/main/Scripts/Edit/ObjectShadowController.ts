import { _decorator, Component, resources, Sprite, UITransform } from 'cc';
import { EditPrefab } from './PrefabData';
const { ccclass, property } = _decorator;

@ccclass('ObjectShadowController')
export class ObjectShadowController extends Component {
    sprite: Sprite;
    transform: UITransform;

    onLoad() {
        this.sprite = this.node.getComponent(Sprite);
        this.transform = this.node.getComponent(UITransform);
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


