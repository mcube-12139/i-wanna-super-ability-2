import { Component } from "cc";
import { PlatformController } from "./PlatformController";
import { Movement } from "./Movement";

export interface ComponentData {
    clone(): ComponentData;
    apply(component: Component): void;
}

export class PlatformControllerData implements ComponentData {
    bounce: boolean;

    constructor(bounce: boolean) {
        this.bounce = bounce;
    }

    clone() {
        return new PlatformControllerData(this.bounce);
    }

    apply(component: PlatformController) {
        component.bounce = this.bounce;
    }
}

export class MovementData implements ComponentData {
    speedX: number;
    speedY: number;

    constructor(speedX: number, speedY: number) {
        this.speedX = speedX;
        this.speedY = speedY;
    }

    clone() {
        return new MovementData(this.speedX, this.speedY);
    }

    apply(component: Movement) {
        component.speedX = this.speedX;
        component.speedY = this.speedY;
    }
}