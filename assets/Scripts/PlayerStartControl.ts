import { _decorator, Component, instantiate, Node } from 'cc';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('PlayerStartControl')
export class PlayerStartControl extends Component {
    start() {
        const player = instantiate(SweetGlobal.playerPrefab);
        player.setParent(SweetGlobal.gameScene.playerContainer);
        player.setPosition(this.node.position.x + 17, this.node.position.y + 9);
        this.destroy();
    }
}
