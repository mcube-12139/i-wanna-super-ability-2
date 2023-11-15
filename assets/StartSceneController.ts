import { _decorator, Component, director, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartSceneController')
export class StartSceneController extends Component {
    start() {
        resources.loadDir("main", (_, __) => {
            director.loadScene("game");
        });
    }
}


