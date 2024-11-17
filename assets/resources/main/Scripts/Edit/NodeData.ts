import { Mat4, Quat, Rect, Vec3, Vec4 } from "cc";
import { EditPrefab } from "./PrefabData";
import { LinkedValue } from "./LinkedValue";
import { IComponentData } from "./ComponentData/IComponentData";
import { TransformData } from "./ComponentData/TransformData";
import { SweetUid } from "../SweetUid";

export class NodeData {
    id: string;
    prefab: EditPrefab;
    prefabData: NodeData;
    name: LinkedValue<string>;
    active: LinkedValue<boolean>;
    contentRect: LinkedValue<Rect>;
    components: IComponentData[];
    parent: NodeData | null;
    children: NodeData[];

    constructor(
        id: string,
        prefab: EditPrefab,
        prefabData: NodeData,
        name: LinkedValue<string>,
        active: LinkedValue<boolean>,
        contentRect: LinkedValue<Rect>,
        components: IComponentData[],
        parent: NodeData | null,
        children: NodeData[]
    ) {
        this.id = id;
        this.prefab = prefab;
        this.prefabData = prefabData;
        this.name = name;
        this.active = active;
        this.contentRect = contentRect;
        this.components = components;
        this.parent = parent;
        this.children = children;
    }

    addChild(data: NodeData) {
        data.parent = this;
        this.children.push(data);
    }

    getContentRect(): Rect {
        return this.prefab !== null ? this.contentRect.getValue(this.prefabData.getContentRect()) : this.contentRect.value;
    }

    serialize(): object {
        return {
            id: this.id,
            prefab: this.prefab.id,
            name: this.name.serialize(),
            active: this.active.serialize(),
            contentRect: this.contentRect.serializeType((rect: Rect) => ({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            })),
            components: this.components.map(component => component.serialize()),
            children: this.children.map(child => child.serialize())
        };
    }

    getTransform(): TransformData | null {
        const component = this.components.find(component => component.getType() === ComponentDataType.TRANSFORM);
        return component !== undefined ? component as TransformData : null;
    }

    getLocalRect(): Rect | null {
        const component = this.getTransform();
        if (component !== null) {
            const contentRect = this.getContentRect();
            const points = [
                new Vec3(contentRect.xMin, contentRect.yMin, 0),
                new Vec3(contentRect.xMin, contentRect.yMax, 0),
                new Vec3(contentRect.xMax, contentRect.yMin, 0),
                new Vec3(contentRect.xMax, contentRect.yMax, 0)
            ];
            component.transformPoints(points);

            const xMin = Math.min.apply(null, [points[0].x, points[1].x, points[2].x, points[3].x]);
            const xMax = Math.max.apply(null, [points[0].x, points[1].x, points[2].x, points[3].x]);
            const yMin = Math.min.apply(null, [points[0].y, points[1].y, points[2].y, points[3].y]);
            const yMax = Math.max.apply(null, [points[0].y, points[1].y, points[2].y, points[3].y]);
            
            return new Rect(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
        }

        return null;
    }

    getGlobalRect(): Rect | null {
        const rect = this.getContentRect();
        const points = [
            new Vec3(rect.xMin, rect.yMin, 0),
            new Vec3(rect.xMin, rect.yMax, 0),
            new Vec3(rect.xMax, rect.yMin, 0),
            new Vec3(rect.xMax, rect.yMax, 0)
        ]

        for (let data: NodeData = this; data !== null; data = data.parent) {
            const transform = data.getTransform();
            if (transform !== null) {
                transform.transformPoints(points);
            } else {
                return null;
            }
        }

        const xMin = Math.min.apply(null, [points[0].x, points[1].x, points[2].x, points[3].x]);
        const xMax = Math.max.apply(null, [points[0].x, points[1].x, points[2].x, points[3].x]);
        const yMin = Math.min.apply(null, [points[0].y, points[1].y, points[2].y, points[3].y]);
        const yMax = Math.max.apply(null, [points[0].y, points[1].y, points[2].y, points[3].y]);
        
        return new Rect(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
    }

    createLinked(prefab: EditPrefab): NodeData {
        return new NodeData(
            SweetUid.create(),
            prefab,
            this,
            new LinkedValue<string>(false, ""),
            new LinkedValue<boolean>(false, false),
            new LinkedValue<Rect>(false, new Rect()),
            this.components.map(component => component.clone()),
            null,
            this.children.map(child => child.createLinked(prefab))
        );
    }
}

export class NodeFile {
    prefabName: string;
    x: number;
    y: number;
    components: any;

    constructor(prefabName: string, x: number, y: number, components: any) {
        this.prefabName = prefabName;
        this.x = x;
        this.y = y;
        this.components = components;
    }
}
