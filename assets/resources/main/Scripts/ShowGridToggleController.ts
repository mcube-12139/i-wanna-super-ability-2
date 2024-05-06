import { _decorator, Component, Node, Toggle } from 'cc';
import { EditSceneController } from './EditSceneController';
const { ccclass, property } = _decorator;

@ccclass('ShowGridToggleController')
export class ShowGridToggleController extends Component {
    start() {
        this.node.on("toggle", this.onToggle, this);

        this.node.getComponent(Toggle).isChecked = EditSceneController.gridVisible;
    }

    onToggle(toggle: Toggle) {
        EditSceneController.instance.setGridVisible(toggle.isChecked);
    }
}


