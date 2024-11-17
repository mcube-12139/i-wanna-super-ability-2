import { EditInstance } from "../EditInstance";
import { NodeData } from "../NodeData";
import { IEditAction } from "./IEditAction";

export class EditActionDeletedData {
    parent: EditInstance;
    data: NodeData;
    instance: EditInstance | null;

    constructor(parent: EditInstance, data: NodeData) {
        this.parent = parent;
        this.data = data;
        this.instance = null;
    }
}

export class EditActionDelete implements IEditAction {
    deleted: EditActionDeletedData[];

    constructor(deleted: EditActionDeletedData[]) {
        this.deleted = deleted;
    }

    undo() {
        for (const item of this.deleted) {
            const instance = EditInstance.fromNodeData(item.data);
            item.parent.addChild(instance);
            item.data = null;
            item.instance = instance;
        } 
    }

    redo() {
        for (const item of this.deleted) {
            item.data = item.instance.data;
            item.instance.destroy();
        }
    }
}