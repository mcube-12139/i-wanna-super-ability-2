import { _decorator, Component, Node } from 'cc';
import { MenuOptionController } from './MenuOptionController';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

export const enum MainMenuOptionId {
    FILE = 0,
    EDIT = 1,
    ROOM = 2,
    OBJECT = 3,
    INSTANCE = 4
}

@ccclass('MainMenuOptionController')
export class MainMenuOptionController extends Component {
    start() {
        const opened = this.node.children[EditSceneController.mainMenuOptionId as number];
        const controller = opened.getComponent(MenuOptionController);
        controller.select();
    }
}


