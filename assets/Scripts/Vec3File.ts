import { Vec3 } from "cc";

export class Vec3File {
    x: number;
    y: number;
    z: number;

    constructor(vec: Vec3) {
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
    }
};