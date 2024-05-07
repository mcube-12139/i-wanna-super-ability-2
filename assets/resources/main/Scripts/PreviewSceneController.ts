import { _decorator, Camera, Component, director, EventKeyboard, Input, input, instantiate, KeyCode, math, Node } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { ComponentTemplate } from './ComponentTemplate';
import { EditSceneController } from './EditSceneController';
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
                for (const template of object.components) {
                    const componentType = ComponentTemplate.getType(template.name);
                    const component = node.getComponent(componentType);
                    template.data.apply(component);
                }
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


