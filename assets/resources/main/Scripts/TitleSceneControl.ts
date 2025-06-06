import { _decorator, Component, director, Node } from 'cc';
import { ButtonController } from './ButtonController';
import { Editor } from './Edit/Editor';
const { ccclass, property } = _decorator;

@ccclass('TitleSceneControl')
export class TitleSceneControl extends Component {
    @property(ButtonController)
    startGameButton!: ButtonController;
    @property(ButtonController)
    loadGameButton!: ButtonController;
    @property(ButtonController)
    selectLevelButton!: ButtonController;
    @property(ButtonController)
    settingButton!: ButtonController;

    start() {
        this.startGameButton.node.on(Node.EventType.TOUCH_END, (e: TouchEvent) => {
            Editor.optionalInstance = new Editor();
            director.loadScene("edit");
        });
    }
}


