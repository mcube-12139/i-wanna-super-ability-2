import { _decorator, Component, instantiate, Label, Node, resources } from 'cc';
import { EditSceneController } from './EditSceneController';
import { ComponentTemplate } from './ComponentTemplate';
const { ccclass, property } = _decorator;

@ccclass('InstComponentsController')
export class InstComponentsController extends Component {
    start() {
        const map = new Map<string, ComponentTemplate[]>();
        for (const object of EditSceneController.selectedObjects) {
            for (const component of object.components) {
                const metaName = component.meta.name;
                if (!map.has(metaName)) {
                    map.set(metaName, [component]);
                } else {
                    map.get(metaName).push(component);
                }
            }
        }

        for (const [name, components] of map.entries()) {
            const label = instantiate(resources.get("main/Prefab/SweetLabel"));
            this.node.addChild(label);
            label.getComponent(Label).string = name;

            const descs = components[0].getDesc(components);
            for (const desc of descs) {
                const editNode = desc.createEditInterface();
                this.node.addChild(editNode);
            }
        }
    }
}


