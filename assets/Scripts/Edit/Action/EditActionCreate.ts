import { EditInstance } from "../EditInstance";
import { NodeData } from "../NodeData";
import { IEditAction } from "./IEditAction";

export class EditActionCreate implements IEditAction {
    parent: EditInstance;
    instances: EditInstance[];
    datas: NodeData[];

    constructor(parent: EditInstance, instances: EditInstance[]) {
        this.parent = parent;
        this.instances = instances;
        this.datas = [];
    }

    undo() {
        for (const instance of this.instances) {
            this.datas.push(instance.data);
            instance.destroy();
        }
        this.instances.length = 0;
    }

    redo() {
        for (const data of this.datas) {
            const instance = EditInstance.fromNodeData(data);
            this.parent.addChild(instance);
            this.instances.push(instance);
        }
        this.datas.length = 0;
    }
}