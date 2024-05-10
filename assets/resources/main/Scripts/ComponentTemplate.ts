import { Component } from "cc";
import { ComponentInstance, MovementInstance, PlatformControllerInstance } from "./ComponentInstance";

export class ComponentTemplateMeta {
    name: string;
    componentType: typeof Component;

    constructor(name: string, componentType: typeof Component) {
        this.name = name;
        this.componentType = componentType;
    }
}

export abstract class ComponentTemplate {
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    abstract newInstance(): ComponentInstance;
}

export class PlatformControllerTemplate extends ComponentTemplate {
    bounce: boolean;

    constructor(id: string, bounce: boolean) {
        super(id);
        this.bounce = bounce;
    }

    newInstance() {
        return PlatformControllerInstance.newUnmodified(this, this.bounce);
    }
}

export class MovementTemplate extends ComponentTemplate {
    speedX: number;
    speedY: number;

    constructor(id: string, speedX: number, speedY: number) {
        super(id);
        this.speedX = speedX;
        this.speedY = speedY;
    }

    newInstance() {
        return MovementInstance.newUnmodified(this, this.speedX, this.speedY);
    }
}
