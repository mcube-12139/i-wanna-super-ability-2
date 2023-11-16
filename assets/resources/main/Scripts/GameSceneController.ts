import { _decorator, Component, director, EventKeyboard, Input, input, KeyCode, Node, Scene } from 'cc';
import { Tag, TagId } from './Tag';
import { SweetGlobal } from './SweetGlobal';
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
            SweetGlobal.load();
        }
    }
}

