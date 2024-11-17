import { Vec3 } from "cc";
import { EditInstance } from "../EditInstance";
import { IEditAction } from "./IEditAction";

export class EditActionDrag implements IEditAction {
    instances: EditInstance[];
    movement: Vec3;

    constructor(instances: EditInstance[], movement: Vec3) {
        this.instances = instances;
        this.movement = movement;
    }

    undo(): void {
        for (const instance of this.instances) {
            instance.setPosition(instance.getPosition().add3f(-this.movement.x, -this.movement.y, -this.movement.z));
        }
    }

    redo(): void {
        for (const instance of this.instances) {
            instance.setPosition(instance.getPosition().add(this.movement));
        }
    }
}