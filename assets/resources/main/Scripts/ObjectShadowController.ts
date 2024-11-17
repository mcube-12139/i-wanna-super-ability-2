import { _decorator, Component, resources, Sprite, UITransform } from 'cc';
import { EditSceneController } from './Edit/EditData';
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

    updateSprite() {
        const data = EditSceneController.nowPrefabData;
        
        this.sprite.spriteFrame = data.sprite;
        this.transform.setAnchorPoint(-data.x / data.width, -data.y / data.height);
        this.transform.setContentSize(data.width, data.height);
    }
}


