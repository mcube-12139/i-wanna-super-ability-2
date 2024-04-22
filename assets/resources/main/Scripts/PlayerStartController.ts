import { _decorator, Component, Node } from 'cc';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('PlayerStartController')
export class PlayerStartController extends Component {
    start() {
        const player = SweetGlobal.createOnLayerByPrefab("Player", "PlayerLayer");
        player.setPosition(this.node.position.x + 17, this.node.position.y + 9);
        this.destroy();
    }
}
