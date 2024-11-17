import { _decorator, Component, Node, resources, Sprite, SpriteFrame } from 'cc';
import { EditSceneController } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('InstSpriteController')
export class InstSpriteController extends Component {
    start() {
        let sprite: SpriteFrame = null;
        for (const object of EditSceneController.selectedObjects) {
            if (sprite === null) {
                sprite = object.prefab.sprite;
            } else {
                if (sprite !== object.prefab.sprite) {
                    sprite = null;
                    break;
                }
            }
        }
        if (sprite !== null) {
            this.getComponent(Sprite).spriteFrame = sprite;
        }
    }
}


