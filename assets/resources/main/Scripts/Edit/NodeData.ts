import { Rect, Vec3 } from "cc";
import { EditPrefab } from "./EditPrefab";
import { LinkedValue } from "./LinkedValue";
import { IComponentData } from "./ComponentData/IComponentData";
import { TransformData } from "./ComponentData/TransformData";
import { SweetUid } from "../SweetUid";
import { SpriteData } from "./ComponentData/SpriteData";
import { ComponentType } from "./ComponentData/ComponentType";
import { ComponentDataTool } from "./ComponentData/ComponentDataTool";
import { Editor } from "./Editor";
import { LinkedArray } from "./LinkedArray";
import { ILinkable } from "../ILinkable";
import { NodeFile } from "./NodeFile";
import { RectFile } from "../RectFile";
import { IComponentFile } from "./ComponentData/IComponentFile";

export class NodeData implements ILinkable<NodeFile, NodeData> {
    id: string;
    editPrefab?: EditPrefab;
    prefab?: NodeData;
    name: LinkedValue<string>;
    active: LinkedValue<boolean>;
    contentRect: LinkedValue<Rect>;
    innerComponents: LinkedArray<IComponentFile, IComponentData>;
    parent?: NodeData;
    innerChildren: LinkedArray<NodeFile, NodeData>;

    get components(): Iterable<IComponentData> {
        return this.innerComponents.iterValues();
    }

    get children(): Iterable<NodeData> {
        return this.innerChildren.iterValues();
    }

    get linkedComponents(): Iterable<IComponentData> {
        return this.innerComponents.iterLinkedValues(this.prefab?.linkedComponents);
    }

    get linkedChildren(): Iterable<NodeData> {
        return this.innerChildren.iterLinkedValues(this.prefab?.linkedChildren);
    }

    constructor(
        id: string,
        editPrefab: EditPrefab | undefined,
        prefab: NodeData | undefined,
        name: LinkedValue<string>,
        active: LinkedValue<boolean>,
        contentRect: LinkedValue<Rect>,
        components: LinkedArray<IComponentFile, IComponentData>,
        parent: NodeData | undefined,
        children: LinkedArray<NodeFile, NodeData>
    ) {
        this.id = id;
        this.editPrefab = editPrefab;
        this.prefab = prefab;
        this.name = name;
        this.active = active;
        this.contentRect = contentRect;
        this.innerComponents = components;
        this.parent = parent;
        this.innerChildren = children;
    }

    static deserialize(data: NodeFile): NodeData {
        const prefab = Editor.instance.getPrefab(data.prefab ?? undefined);

        const children = LinkedArray.deserialize(data.children, (value: NodeFile) => NodeData.deserialize(value));
        const nodeData = new NodeData(
            data.id,
            prefab,
            prefab?.data,
            LinkedValue.deserialize(data.name),
            LinkedValue.deserialize(data.active),
            LinkedValue.deserializeSpecial(data.contentRect, (value: RectFile) => new Rect(
                value.x,
                value.y,
                value.width,
                value.height
            )),
            LinkedArray.deserialize(data.components, (value: IComponentFile) => ComponentDataTool.deserialize(value)),
            undefined,
            children
        );

        for (const child of children.iterValues()) {
            child.parent = nodeData;
        }

        return nodeData;
    }

    addChild(data: NodeData) {
        data.parent = this;
        this.innerChildren.push(this.editPrefab?.data.linkedChildren, data);
    }

    getContentRect(): Rect {
        return this.prefab !== undefined ? this.contentRect.getValue(this.prefab.getContentRect()) : this.contentRect.value!;
    }

    serialize() {
        return new NodeFile(
            this.id,
            this.prefab?.id ?? null,
            this.name.serialize(),
            this.active.serialize(),
            this.contentRect.serializeSpecial((rect: Rect) => new RectFile(
                rect.x,
                rect.y,
                rect.width,
                rect.height
            )),
            this.innerComponents.serialize(),
            this.innerChildren.serialize()
        );
    }

    getTransform(): TransformData | undefined {
        for (const component of this.components) {
            if (component.getType() === ComponentType.TRANSFORM) {
                return component as TransformData;
            }
        }

        return undefined;
    }

    getSprite(): SpriteData | undefined {
        for (const component of this.components) {
            if (component.getType() === ComponentType.SPRITE) {
                return component as SpriteData;
            }
        }

        return undefined;
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
                break;
            }
        }

        const xMin = Math.min.apply(null, [points[0].x, points[1].x, points[2].x, points[3].x]);
        const xMax = Math.max.apply(null, [points[0].x, points[1].x, points[2].x, points[3].x]);
        const yMin = Math.min.apply(null, [points[0].y, points[1].y, points[2].y, points[3].y]);
        const yMax = Math.max.apply(null, [points[0].y, points[1].y, points[2].y, points[3].y]);
        
        return new Rect(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
    }

    createLinked(): NodeData {
        return new NodeData(
            SweetUid.create(),
            undefined,
            this,
            LinkedValue.createLinked<string>(),
            LinkedValue.createLinked<boolean>(),
            LinkedValue.createLinked<Rect>(),
            LinkedArray.createLinked(this.innerComponents.iterValues()),
            undefined,
            LinkedArray.createLinked(this.innerChildren.iterValues())
        );
    }
}
