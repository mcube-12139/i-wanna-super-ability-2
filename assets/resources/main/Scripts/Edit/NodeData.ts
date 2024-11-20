import { Rect, Vec3 } from "cc";
import { EditPrefab } from "./EditPrefab";
import { LinkedValue } from "./LinkedValue";
import { IComponentData } from "./ComponentData/IComponentData";
import { TransformData } from "./ComponentData/TransformData";
import { SweetUid } from "../SweetUid";
import { SpriteData } from "./ComponentData/SpriteData";
import { ComponentType } from "./ComponentData/ComponentType";
import { ComponentDataTool } from "./ComponentData/ComponentDataTool";
import { EditData } from "./EditData";

export class NodeData {
    id: string;
    prefab?: EditPrefab;
    prefabData?: NodeData;
    name: LinkedValue<string>;
    active: LinkedValue<boolean>;
    contentRect: LinkedValue<Rect>;
    components: IComponentData[];
    parent?: NodeData;
    children: NodeData[];

    constructor(
        id: string,
        prefab: EditPrefab | undefined,
        prefabData: NodeData | undefined,
        name: LinkedValue<string>,
        active: LinkedValue<boolean>,
        contentRect: LinkedValue<Rect>,
        components: IComponentData[],
        parent: NodeData | undefined,
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

    static deserialize(data: any): NodeData {
        const prefab = EditData.instance.getPrefab(data.prefab);

        const children: NodeData[] = [];
        const nodeData = new NodeData(
            data.id,
            prefab,
            prefab?.data ?? undefined,
            LinkedValue.deserialize<string>(data.name),
            LinkedValue.deserialize<boolean>(data.active),
            LinkedValue.deserializeSpecial<Rect>(data.contentRect, (value: any) => new Rect(
                value.x,
                value.y,
                value.width,
                value.height
            )),
            data.components.map((component: any) => ComponentDataTool.deserialize(component)),
            undefined,
            children
        );

        for (const child of data.children) {
            const childData = NodeData.deserialize(child);
            childData.parent = nodeData;
            children.push(childData);
        }

        return nodeData;
    }

    addChild(data: NodeData) {
        data.parent = this;
        this.children.push(data);
    }

    getContentRect(): Rect {
        return this.prefabData !== undefined ? this.contentRect.getValue(this.prefabData.getContentRect()) : this.contentRect.value;
    }

    serialize(): object {
        return {
            id: this.id,
            prefab: this.prefab?.id ?? null,
            name: this.name.serialize(),
            active: this.active.serialize(),
            contentRect: this.contentRect.serializeSpecial((rect: Rect) => ({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            })),
            components: this.components.map(component => ComponentDataTool.serialize(component)),
            children: this.children.map(child => child.serialize())
        };
    }

    getTransform(): TransformData | undefined {
        const component = this.components.find(component => component.getType() === ComponentType.TRANSFORM);
        return component !== undefined ? component as TransformData : undefined;
    }

    getSprite(): SpriteData | undefined {
        const component = this.components.find(component => component.getType() === ComponentType.SPRITE);
        return component !== undefined ? component as SpriteData : undefined;
    }

    getLocalRect(): Rect | undefined {
        const component = this.getTransform();
        if (component !== undefined) {
            const contentRect = this.getContentRect();
            const points = [
                new Vec3(contentRect.xMin, contentRect.yMin, 0),
                new Vec3(contentRect.xMin, contentRect.yMax - 1, 0),
                new Vec3(contentRect.xMax - 1, contentRect.yMin, 0),
                new Vec3(contentRect.xMax - 1, contentRect.yMax - 1, 0)
            ];
            component.transformPoints(points);

            const xMin = Math.min.apply(null, [points[0].x, points[1].x, points[2].x, points[3].x]);
            const xMax = Math.max.apply(null, [points[0].x, points[1].x, points[2].x, points[3].x]);
            const yMin = Math.min.apply(null, [points[0].y, points[1].y, points[2].y, points[3].y]);
            const yMax = Math.max.apply(null, [points[0].y, points[1].y, points[2].y, points[3].y]);
            
            return new Rect(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
        }

        return undefined;
    }

    getGlobalRect(): Rect | undefined {
        const rect = this.getContentRect();
        const points = [
            new Vec3(rect.xMin, rect.yMin, 0),
            new Vec3(rect.xMin, rect.yMax - 1, 0),
            new Vec3(rect.xMax - 1, rect.yMin, 0),
            new Vec3(rect.xMax - 1, rect.yMax - 1, 0)
        ]

        for (let data: NodeData | undefined = this; data !== undefined; data = data.parent) {
            const transform = data.getTransform();
            if (transform !== undefined) {
                transform.transformPoints(points);
            } else {
                return undefined;
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
            this.components.map(component => component.createLinked()),
            undefined,
            this.children.map(child => child.createLinked(prefab))
        );
    }
}
