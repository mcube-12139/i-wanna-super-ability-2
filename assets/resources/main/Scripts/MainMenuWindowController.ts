import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node } from 'cc';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('MainMenuWindowController')
export class MainMenuWindowController extends Component {
    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(e: EventKeyboard) {
        if (e.keyCode === KeyCode.ESCAPE) {
            EditSceneController.instance.closeWindow();
        }
    }
}


