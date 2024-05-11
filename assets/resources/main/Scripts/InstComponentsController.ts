import { _decorator, Component } from 'cc';
import { EditSceneController } from './EditSceneController';
import { NodeComponents } from './NodeComponents';
const { ccclass, property } = _decorator;

@ccclass('InstComponentsController')
export class InstComponentsController extends Component {
    start() {
        const editNode = NodeComponents.createEditInterface(EditSceneController.selectedObjects.map(v => v.components));
        this.node.addChild(editNode);
    }
}


