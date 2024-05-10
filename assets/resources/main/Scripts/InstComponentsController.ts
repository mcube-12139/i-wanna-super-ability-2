import { _decorator, Component, instantiate, Label, Node, resources } from 'cc';
import { EditSceneController } from './EditSceneController';
import { ComponentInstance } from './ComponentInstance';
const { ccclass, property } = _decorator;

@ccclass('InstComponentsController')
export class InstComponentsController extends Component {
    start() {
        const map = new Map<string, ComponentInstance[]>();
        for (const object of EditSceneController.selectedObjects) {
            for (const instance of object.components.data) {
                const metaName = instance.meta.type;
                if (!map.has(metaName)) {
                    map.set(metaName, [instance]);
                } else {
                    map.get(metaName).push(instance);
                }
            }
        }

        const componentLists = EditSceneController.selectedObjects.map(v => v.components);
        for (const [name, instances] of map.entries()) {
            const labelNode = instantiate(resources.get("main/Prefab/SweetLabel"));
            this.node.addChild(labelNode);
            const label = labelNode.getComponent(Label);
            label.string = name;
            // 计算组件是否被修改

            const descs = instances[0].getDesc(instances, componentLists);
            for (const desc of descs) {
                const editNode = desc.createEditInterface();
                this.node.addChild(editNode);
            }
        }
    }
}


