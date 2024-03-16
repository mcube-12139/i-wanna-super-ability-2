import { _decorator, Component, EventKeyboard, EventMouse, find, Input, input, KeyCode, Node, Sprite } from 'cc';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('ObjectShadowController')
export class ObjectShadowController extends Component {
    sprite: Sprite;

    onLoad() {
        this.sprite = this.node.getComponent(Sprite);
    }
    
    enable() {
        this.sprite.enabled = true;
    }

    disable() {
        this.sprite.enabled = false;
    }
}


