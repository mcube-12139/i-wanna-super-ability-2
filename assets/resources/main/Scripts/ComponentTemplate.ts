import { Component } from "cc";
import { BooleanData, NumberData, DataType } from "./DataType";
import { Movement } from "./Movement";
import { PlatformController } from "./PlatformController";

export class ComponentTemplateMeta {
    name: string;
    componentType: typeof Component;
    fromFile: (data: any) => ComponentTemplate;

    constructor(name: string, componentType: typeof Component, fromFile: (data: any) => ComponentTemplate) {
        this.name = name;
        this.componentType = componentType;
        this.fromFile = fromFile;
    }
}

export abstract class ComponentTemplate {
    meta: ComponentTemplateMeta;

    static metaMap: Map<string, ComponentTemplateMeta>;

    static initMetaMap() {
        this.metaMap = new Map<string, ComponentTemplateMeta>([
            [PlatformControllerTemplate.meta.name, PlatformControllerTemplate.meta],
            [MovementTemplate.meta.name, MovementTemplate.meta]
        ]);
    }

    static fromFile(data: any) {
        return this.metaMap.get(data.type).fromFile(data);
    }

    static toFiles(datas: ComponentTemplate[]) {
        return datas.map(v => v.toFile());
    }

    constructor(meta: ComponentTemplateMeta) {
        this.meta = meta;
    }

    abstract clone(): ComponentTemplate;
    abstract apply(component: Component): void;
    abstract getDesc(datas: ComponentTemplate[]): DataType[];
    abstract toFile(): object;
}

export class PlatformControllerTemplate extends ComponentTemplate {
    static meta = new ComponentTemplateMeta("PlatformController", PlatformController, data => new PlatformControllerTemplate(data.bounce));

    bounce: boolean;

    constructor(bounce: boolean) {
        super(PlatformControllerTemplate.meta);
        this.bounce = bounce;
    }

    clone() {
        return new PlatformControllerTemplate(this.bounce);
    }

    apply(component: PlatformController) {
        component.bounce = this.bounce;
    }

    getDesc(datas: PlatformControllerTemplate[]): DataType[] {
        return [
            new BooleanData("bounce", () => datas.map(v => v.bounce), value => datas.forEach(v => v.bounce = value))
        ]
    }

    toFile(): object {
        return {
            type: "PlatformController",
            bounce: this.bounce
        };
    }
}

export class MovementTemplate extends ComponentTemplate {
    static meta = new ComponentTemplateMeta("Movement", Movement, data => new MovementTemplate(data.speedX, data.speedY));

    speedX: number;
    speedY: number;

    constructor(speedX: number, speedY: number) {
        super(MovementTemplate.meta);
        this.speedX = speedX;
        this.speedY = speedY;
    }

    clone() {
        return new MovementTemplate(this.speedX, this.speedY);
    }

    apply(component: Movement) {
        component.speedX = this.speedX;
        component.speedY = this.speedY;
    }

    getDesc(datas: MovementTemplate[]): DataType[] {
        return [
            new NumberData("speedX", () => datas.map(v => v.speedX), value => datas.forEach(v => v.speedX = value)),
            new NumberData("speedY", () => datas.map(v => v.speedY), value => datas.forEach(v => v.speedY = value))
        ]
    }

    toFile(): object {
        return {
            type: "Movement",
            speedX: this.speedX,
            speedY: this.speedY
        };
    }
}
