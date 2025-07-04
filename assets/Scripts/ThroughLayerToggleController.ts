import { _decorator, Component, Node, Toggle } from 'cc';
import { EditSceneController } from './Edit/Editor';
const { ccclass, property } = _decorator;

@ccclass('ThroughLayerToggleController')
export class ThroughLayerToggleController extends Component {
    start() {
        const toggle = this.getComponent(Toggle);
        toggle.isChecked = EditSceneController.throughLayer;

        this.node.on("toggle", this.onToggle, this);
    }

    onToggle(toggle: Toggle) {
        EditSceneController.throughLayer = toggle.isChecked;
    }
}


