import { Mat4, Node, Quat, Vec3 } from "cc";
import { IComponentData } from "./IComponentData";
import { ComponentType } from "./ComponentType";
import { LinkedValue } from "../LinkedValue";
import { SweetUid } from "../../SweetUid";
import { EditData } from "../EditData";

export class TransformData implements IComponentData {
    id: string;
    prefab?: TransformData;

    position: LinkedValue<Vec3>;
    rotation: LinkedValue<Vec3>;
    scale: LinkedValue<Vec3>;

    constructor(id: string, prefab: TransformData | undefined, position: LinkedValue<Vec3>, rotation: LinkedValue<Vec3>, scale: LinkedValue<Vec3>) {
        this.id = id;
        this.prefab = prefab;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    static deserialize(data: any) {
        return new TransformData(
            data.id,
            EditData.instance.getComponentPrefab(data.prefab) as (TransformData | undefined),
            LinkedValue.deserializeSpecial<Vec3>(data.data.position, (value: any) => new Vec3(value.x, value.y, value.z)),
            LinkedValue.deserializeSpecial<Vec3>(data.data.rotation, (value: any) => new Vec3(value.x, value.y, value.z)),
            LinkedValue.deserializeSpecial<Vec3>(data.data.scale, (value: any) => new Vec3(value.x, value.y, value.z)),
        );
    }

    createLinked(): IComponentData {
        return new TransformData(
            SweetUid.create(),
            this,
            new LinkedValue(false, new Vec3()),
            new LinkedValue(false, new Vec3()),
            new LinkedValue(false, new Vec3())
        );
    }

    getPosition(): Vec3 {
        if (this.prefab !== undefined) {
            return this.position.getValue(this.prefab.getPosition());
        }

        return this.position.value;
    }

    getRotation(): Vec3 {
        if (this.prefab !== undefined) {
            return this.rotation.getValue(this.prefab.getRotation());
        }

        return this.rotation.value;
    }

    getScale(): Vec3 {
        if (this.prefab !== undefined) {
            return this.scale.getValue(this.prefab.getScale());
        }

        return this.scale.value;
    }

    addToNode(node: Node): void {
        node.setPosition(this.getPosition());
        node.setRotationFromEuler(this.getRotation());
        node.setScale(this.getScale());
    }

    serializeData() {
        return {
            position: this.position.serializeSpecial(value => ({
                x: value.x,
                y: value.y,
                z: value.z
            })),
            rotation: this.rotation.serializeSpecial(value => ({
                x: value.x,
                y: value.y,
                z: value.z
            })),
            scale: this.scale.serializeSpecial(value => ({
                x: value.x,
                y: value.y,
                z: value.z
            }))
        };
    }
    
    getType(): ComponentType {
        return ComponentType.TRANSFORM;
    }

    transformPoints(points: Vec3[]): void {
        // 创建变换矩阵
        const matrix = new Mat4();
        const rotation = new Quat();
        const linkedRotation = this.getRotation();
        Quat.fromEuler(rotation, linkedRotation.x, linkedRotation.y, linkedRotation.z);
        Mat4.fromSRT(
            matrix,
            rotation,
            this.getPosition(),
            this.getScale()
        );

        for (const point of points) {
            Vec3.transformMat4(point, point, matrix);
        }
    }
}