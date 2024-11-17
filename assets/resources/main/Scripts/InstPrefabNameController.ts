import { _decorator, Component, Label, Node } from 'cc';
import { EditSceneController } from './Edit/EditData';
const { ccclass, property } = _decorator;

@ccclass('InstPrefabNameController')
export class InstPrefabNameController extends Component {
    start() {
        let prefabName = "";
        for (const object of EditSceneController.selectedObjects) {
            if (prefabName === "") {
                prefabName = object.prefab.name;
            } else {
                if (prefabName !== object.prefab.name) {
                    prefabName = "<multiple>";
                    break;
                }
            }
        }
        this.getComponent(Label).string = prefabName;
    }
}


