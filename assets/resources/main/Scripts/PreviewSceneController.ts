import { _decorator, Camera, Component, director, EventKeyboard, Input, input, KeyCode, math } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { EditSceneController } from './Edit/Editor';
const { ccclass, property } = _decorator;

@ccclass('PreviewSceneController')
export class PreviewSceneController extends Component {
    start() {
        this.node.getChildByName("Camera").getComponent(Camera).clearColor = new math.Color(EditSceneController.nowRoomBackColor);

        // 创建节点
        for (const layer of EditSceneController.layers) {
            for (const object of layer.objects) {
                const node = SweetGlobal.createOnLayerByPrefab(object.prefab.name, layer.name);
                node.setPosition(object.x, object.y);
                object.components.addToNode(node);
            }
        }
        
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_R) {
            SweetGlobal.load();
        } else if (event.keyCode === KeyCode.ESCAPE) {
            director.loadScene("edit");
        }
    }
}


