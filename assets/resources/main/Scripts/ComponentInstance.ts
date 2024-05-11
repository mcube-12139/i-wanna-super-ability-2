import { Label, Node, instantiate, math, resources } from "cc";
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

    abstract getDataDesc(instances: ComponentInstance[]): DataType[];
    abstract toFileModified(): object;

    static isInstancesModified(instances: ComponentInstance[]) {
        return instances.findIndex(v => v.modified) !== -1;
    }

    static isFieldModified<T>(instances: ComponentInstance[], fieldGetter: (field: ComponentInstance) => DataField<T>): boolean {
        return instances.findIndex(v => fieldGetter(v).modified) !== -1;
    }

    abstract addToNode(node: Node): void;

    static createInterface(instances: ComponentInstance[], componentLists: NodeComponents[]): Node {
        const container = instantiate(resources.get("main/Prefab/SweetLayoutVer"));

        const labelNode = instantiate(resources.get("main/Prefab/SweetLabel"));
        container.addChild(labelNode);
        const label = labelNode.getComponent(Label);
        if (!this.isInstancesModified(instances)) {
            label.color = new math.Color("#A3FF6F");
        }
        label.string = instances[0].meta.type;

        const descs = instances[0].getDataDesc(instances);
        for (const desc of descs) {
            const editNode = desc.createEditInterface(() => {
                label.color = math.Color.WHITE;
                instances.forEach(inst => inst.modified = true);
                componentLists.forEach(v => v.modified = true);
            });
            container.addChild(editNode);
        }

        return container;
    }

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

    getDataDesc(instances: PlatformControllerInstance[]): DataType[] {
        return [
            new BooleanData(
                "bounce", 
                () => instances.map(inst => inst.bounce.get(inst.template.bounce)),
                (value: boolean) => instances.forEach(inst => inst.bounce.set(value)),
                ComponentInstance.isFieldModified(instances, (inst: PlatformControllerInstance) => inst.bounce)
            )
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

    getDataDesc(instances: MovementInstance[]): DataType[] {
        return [
            new NumberData(
                "speedX",
                () => instances.map(inst => inst.speedX.get(inst.template.speedX)),
                (value: number) => instances.forEach(inst => inst.speedX.set(value)),
                ComponentInstance.isFieldModified(instances, (inst: MovementInstance) => inst.speedX)
            ),
            new NumberData(
                "speedY",
                () => instances.map(inst => inst.speedY.get(inst.template.speedY)),
                (value: number) => instances.forEach(inst => inst.speedY.set(value)),
                ComponentInstance.isFieldModified(instances, (inst: MovementInstance) => inst.speedY)
            )
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