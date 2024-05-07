import { _decorator, Component, instantiate, Label, Node, resources } from 'cc';
import { EditSceneController } from './EditSceneController';
import { ComponentData } from './ComponentData';
const { ccclass, property } = _decorator;

@ccclass('InstComponentsController')
export class InstComponentsController extends Component {
    start() {
        const map = new Map<string, ComponentData[]>();
        for (const object of EditSceneController.selectedObjects) {
            for (const component of object.components) {
                let arr: ComponentData[];
                if (!map.has(component.name)) {
                    arr = [component.data];
                } else {
                    arr = map.get(component.name);
                    arr.push(component.data);
                }
                map.set(component.name, arr);
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


