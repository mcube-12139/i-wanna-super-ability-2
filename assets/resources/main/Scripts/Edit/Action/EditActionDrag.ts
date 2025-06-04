import { Vec3 } from "cc";
import { EditInstance } from "../EditInstance";
import { IEditAction } from "./IEditAction";
import { Editor } from "../Editor";
import { RoomEditPage } from "../Page/RoomEditPage";

export class EditActionDrag implements IEditAction {
    instances: EditInstance[];
    movement: Vec3;

    constructor(instances: EditInstance[], movement: Vec3) {
        this.instances = instances;
        this.movement = movement;
    }

    undo(): void {
        for (const instance of this.instances) {
            (Editor.instance.nowPage as RoomEditPage).setInstancePosition(instance, instance.getPosition()!.add3f(-this.movement.x, -this.movement.y, -this.movement.z));
        }
    }

    redo(): void {
        for (const instance of this.instances) {
            (Editor.instance.nowPage as RoomEditPage).setInstancePosition(instance, instance.getPosition()!.add(this.movement));
        }
    }
}