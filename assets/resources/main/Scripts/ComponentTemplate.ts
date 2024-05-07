import { Component } from "cc";
import { ComponentData, MovementData, PlatformControllerData } from "./ComponentData";
import { Movement } from "./Movement";
import { PlatformController } from "./PlatformController";

export class ComponentTemplateFile {
    name: string;
    data: object;

    constructor(name: string, data: object) {
        this.name = name;
        this.data = data;
    }
}

export class ComponentTemplateMeta {
    componentType: typeof Component;
    create: (data: any) => ComponentTemplate;

    constructor(componentType: typeof Component, create: (data: any) => ComponentTemplate) {
        this.componentType = componentType;
        this.create = create;
    }
}

export class ComponentTemplate {
    name: string;
    data: ComponentData;

    static typeMap = new Map<string, ComponentTemplateMeta>([
        ["PlatformController", new ComponentTemplateMeta(PlatformController, data => new ComponentTemplate("PlatformController", new PlatformControllerData(data.bounce)))],
        ["Movement", new ComponentTemplateMeta(Movement, data => new ComponentTemplate("Movement", new MovementData(data.speedX, data.speedY)))]
    ]);

    constructor(name: string, data: ComponentData) {
        this.name = name;
        this.data = data;
    }

    static create(name: string, data: any) {
        return this.typeMap.get(name).create(data);
    }

    static getType(name: string): typeof Component {
        return this.typeMap.get(name).componentType;
    }
}

