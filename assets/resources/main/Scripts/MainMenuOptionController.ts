import { _decorator, Component, Node } from 'cc';
import { EditSceneController } from './EditSceneController';
import { MenuOptionController } from './MenuOptionController';
import { EditorData } from './EditorData';
const { ccclass, property } = _decorator;

export const enum MainMenuOptionId {
    FILE = 0,
    EDIT = 1,
    ROOM = 2,
    OBJECT = 3
}

@ccclass('MainMenuOptionController')
export class MainMenuOptionController extends Component {
    start() {
        const opened = this.node.children[EditorData.mainMenuOptionIndex as number];
        const controller = opened.getComponent(MenuOptionController);
        controller.select();
    }
}


