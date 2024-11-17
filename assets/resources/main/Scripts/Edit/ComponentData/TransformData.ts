import { Mat4, Node, Quat, Vec3 } from "cc";
import { IComponentData } from "./IComponentData";

export class TransformData implements IComponentData {
    id: string;
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;

    constructor(id: string, position: Vec3, rotation: Vec3, scale: Vec3) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    clone(): IComponentData {
        return new TransformData(this.id, this.position, this.rotation, this.scale);
    }

    addToNode(node: Node): void {
        node.setPosition(this.position);
        node.setRotationFromEuler(this.rotation);
        node.setScale(this.scale);
    }

    serialize(): object {
        return {
            id: this.id,
            position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z
            },
            rotation: {
                x: this.rotation.x,
                y: this.rotation.y,
                z: this.rotation.z
            },
            scale: {
                x: this.scale.x,
                y: this.scale.y,
                z: this.scale.z
            }
        };
    }
    
    getType(): ComponentDataType {
        return ComponentDataType.TRANSFORM;
    }

    transformPoints(points: Vec3[]): void {
        // 创建变换矩阵
        const matrix = new Mat4();
        const rotation = new Quat();
        Quat.fromEuler(rotation, this.rotation.x, this.rotation.y, this.rotation.z);
        Mat4.fromSRT(
            matrix,
            rotation,
            this.position,
            this.scale
        );

        for (const point of points) {
            Vec3.transformMat4(point, point, matrix);
        }
    }
}