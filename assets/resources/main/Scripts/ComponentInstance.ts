import { Node } from "cc";
import { ComponentTemplate, MovementTemplate, PlatformControllerTemplate } from "./ComponentTemplate";
import { DataField } from "./DataField";
import { BooleanData, DataType, NumberData } from "./DataType";
import { NodeComponents } from "./NodeComponents";
import { PlatformController } from "./PlatformController";
import { Movement } from "./Movement";

export class ComponentInstanceMeta {
    type: string;
    fromFile: (file: any, template: ComponentTemplate) => ComponentInstance;

    constructor(type: string, fromFile: (file: any, template: ComponentTemplate) => ComponentInstance) {
        this.type = type;
        this.fromFile = fromFile;
    }
}

export abstract class ComponentInstance {
    abstract template: ComponentTemplate;
    meta: ComponentInstanceMeta;
    modified: boolean;

    static metaMap: Map<string, ComponentInstanceMeta>;

    constructor(meta: ComponentInstanceMeta, modified: boolean) {
        this.meta = meta;
        this.modified = modified;
    }

    static initMetaMap() {
        this.metaMap = new Map([
            [PlatformControllerInstance.meta.type, PlatformControllerInstance.meta],
            [MovementInstance.meta.type, MovementInstance.meta]
        ])
    }

    static fromFiles(file: any, templates: ComponentTemplate[]) {
        const orderModified = file.orderModified;
        const data: any[] = file.data;
        
        if (!orderModified) {
            const dataIdMap = new Map(data.map(v => [v.id, v.data]));
            return templates.map(template => {
                if (!dataIdMap.has(template.id)) {
                    return template.newInstance();
                }
                const instanceData = dataIdMap.get(template.id);
                return this.metaMap.get(instanceData.type).fromFile(instanceData, template);
            });
        }

        const idMap = new Map(templates.map(v => [v.id, v]));
        return data.map(instanceData => {
            const template = idMap.get(instanceData.id);
            if (!instanceData.modified) {
                return template.newInstance();
            }
            return this.metaMap.get(instanceData.data.type).fromFile(instanceData.data, template);
        });
    }

    static toFiles(datas: ComponentInstance[]) {
        return datas.map(v => v.toFile());
    }

    abstract getDesc(instances: ComponentInstance[], componentLists: NodeComponents[]): DataType[];
    abstract toFileModified(): object;

    static fieldGetter<T>(instances: ComponentInstance[], getter: (instance: ComponentInstance) => T) {
        return () => instances.map(v => getter(v));
    }

    static fieldSetter<T>(instances: ComponentInstance[], componentLists: NodeComponents[], setter: (instance: ComponentInstance, value: T) => void) {
        return (value: T) => {
            instances.forEach(inst => {
                inst.modified = true;
                setter(inst, value);
            });
            componentLists.forEach(v => v.modified = true);
        }
    }

    abstract addToNode(node: Node): void;

    toFile(): object {
        if (!this.modified) {
            return {
                modified: false,
                id: this.template.id
            };
        }
        return {
            modified: true,
            id: this.template.id,
            data: this.toFileModified()
        };
    }
}

export class PlatformControllerInstance extends ComponentInstance {
    static meta = new ComponentInstanceMeta("PlatformController", (data, template: PlatformControllerTemplate) => new PlatformControllerInstance(true, template, DataField.fromFile(data.bounce, template.bounce)));

    template: PlatformControllerTemplate;

    bounce: DataField<boolean>;

    constructor(modified: boolean, template: PlatformControllerTemplate, bounce: DataField<boolean>) {
        super(PlatformControllerInstance.meta, modified);
        this.template = template;
        this.bounce = bounce;
    }

    static newUnmodified(template: PlatformControllerTemplate, bounce: boolean) {
        return new PlatformControllerInstance(false, template, new DataField(false, bounce));
    }

    getDesc(instances: PlatformControllerInstance[], componentLists: NodeComponents[]): DataType[] {
        return [
            new BooleanData("bounce", ComponentInstance.fieldGetter(instances, (inst: PlatformControllerInstance) => inst.bounce.get(inst.template.bounce)), ComponentInstance.fieldSetter(instances, componentLists, (inst: PlatformControllerInstance, value) => inst.bounce.set(value)))
        ];
    }

    addToNode(node: Node): void {
        const controller = node.addComponent(PlatformController);
        controller.bounce = this.bounce.get(this.template.bounce);
    }

    toFileModified() {
        return {
            type: "PlatformController",
            bounce: this.bounce.toFile()
        };
    }
}

export class MovementInstance extends ComponentInstance {
    static meta = new ComponentInstanceMeta("Movement", (data, template: MovementTemplate) => new MovementInstance(true, template, DataField.fromFile(data.speedX, template.speedX), DataField.fromFile(data.speedY, template.speedY)));

    template: MovementTemplate;

    speedX: DataField<number>;
    speedY: DataField<number>;

    constructor(modified: boolean, template: MovementTemplate, speedX: DataField<number>, speedY: DataField<number>) {
        super(MovementInstance.meta, modified);
        this.template = template;
        this.speedX = speedX;
        this.speedY = speedY;
    }

    static newUnmodified(template: MovementTemplate, speedX: number, speedY: number) {
        return new MovementInstance(false, template, new DataField(false, speedX), new DataField(false, speedY));
    }

    getDesc(instances: MovementInstance[], componentLists: NodeComponents[]): DataType[] {
        return [
            new NumberData("speedX", ComponentInstance.fieldGetter(instances, (inst: MovementInstance) => inst.speedX.get(inst.template.speedX)), ComponentInstance.fieldSetter(instances, componentLists, (inst: MovementInstance, value) => inst.speedX.set(value))),
            new NumberData("speedY", ComponentInstance.fieldGetter(instances, (inst: MovementInstance) => inst.speedY.get(inst.template.speedY)), ComponentInstance.fieldSetter(instances, componentLists, (inst: MovementInstance, value) => inst.speedY.set(value)))
        ];
    }

    addToNode(node: Node): void {
        const controller = node.addComponent(Movement);
        controller.speedX = this.speedX.get(this.template.speedX);
        controller.speedY = this.speedY.get(this.template.speedY);
    }

    toFileModified() {
        return {
            type: "Movement",
            speedX: this.speedX.toFile(),
            speedY: this.speedY.toFile()
        };
    }
}