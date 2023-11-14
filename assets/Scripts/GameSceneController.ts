import { _decorator, Component, Director, EventKeyboard, Input, input, KeyCode, Node, Scene } from 'cc';
import { Tag, TagId } from './Tag';
const { ccclass, property } = _decorator;

@ccclass('GameSceneController')
export class GameSceneController extends Component {
    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(_: number) {
        
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_R) {
            Director.instance.loadScene("game");
        }
    }
}


