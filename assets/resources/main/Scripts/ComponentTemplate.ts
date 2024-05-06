import { Component } from "cc";
import { ComponentData } from "./ComponentData";
import { Movement } from "./Movement";
import { PlatformController } from "./PlatformController";

export class ComponentTemplate {
    type: string;
    data: ComponentData;

    static typeMap = new Map<string, typeof Component>([
        ["PlatformController", PlatformController],
        ["Movement", Movement]
    ]);

    constructor(type: string, data: any) {
        this.type = type;
        this.data = data;
    }

    static getType(name: string): typeof Component {
        return this.typeMap.get(name);
    }
}

