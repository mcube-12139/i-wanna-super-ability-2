import { _decorator, Component, director, EventKeyboard, Input, input, instantiate, KeyCode, Node } from 'cc';
import { EditorData } from './EditorData';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('PreviewSceneController')
export class PreviewSceneController extends Component {
    start() {
        // 创建节点
        console.log(EditorData.layers);
        for (const layer of EditorData.layers) {
            for (const object of layer.objects) {
                const node = SweetGlobal.createOnLayerByPrefab(object.prefabName, layer.name);
                node.setPosition(object.x, object.y);
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


