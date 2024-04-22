import { _decorator, Component, EventKeyboard, EventMouse, find, Input, input, KeyCode, Node, resources, Sprite, SpriteFrame, UITransform } from 'cc';
import { EditSceneController } from './EditSceneController';
import { PrefabData } from './PrefabData';
import { EditorData } from './EditorData';
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
        const data = EditorData.nowPrefabData;
        
        this.sprite.spriteFrame = resources.get(`main/Sprites/${data.sprite}/spriteFrame`);
        this.transform.setAnchorPoint(-data.x / data.width, -data.y / data.height);
        this.transform.setContentSize(data.width, data.height);
    }
}


