import { instantiate, Node, Prefab, resources } from "cc";
import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";
import { RoomResource } from "./RoomResource";
import { RootResource } from "./RootResource";
import { ResourceItemControl } from "../ResourceItemControl";

export class EditResourceTool {
    static createItemNode(resource: IEditResource, depth: number): Node {
        const node = instantiate(resources.get("main/Prefab/ResourceItem", Prefab)!);
        if (depth !== 0) {
            node.setPosition(16 * depth, 0, 0);
        }
        const control = node.getComponent(ResourceItemControl)!;
        control.setData(resource);

        if (resource.children !== undefined) {
            for (const child of resource.children) {
                const childNode = this.createItemNode(child, depth + 1);
                control.children!.addChild(childNode);
            }
        }

        return node;
    }

    static addChild(resource: IEditResource, child: IEditResource): void {
        resource.children!.push(child);
        child.parent = resource;
    }

    static findTypeName(resource: IEditResource, type: EditResourceType, name: string): IEditResource | undefined {
        if (resource.type === type && resource.name === name) {
            return resource;
        }

        if (resource.children !== undefined) {
            for (const child of resource.children) {
                const found = this.findTypeName(child, type, name);
                if (found !== undefined) {
                    return found;
                }
            }
        }

        return undefined;
    }

    static serialize(resource: IEditResource): object {
        return {
            id: resource.id,
            type: resource.type,
            name: resource.name,
            children: resource.children?.map(child => this.serialize(child)) ?? null
        }
    }

    static deserialize(data: any): IEditResource {
        const type = data.type;
        if (type === EditResourceType.ROOT) {
            const children: IEditResource[] = [];
            const resource = new RootResource(data.id, data.name, children);
            for (const childData of data.children) {
                const child = EditResourceTool.deserialize(childData);
                children.push(child);
                child.parent = resource;
            }

            return resource;
        }
        if (type === EditResourceType.ROOM) {
            return new RoomResource(data.id, data.name, undefined);
        }
        
        throw new Error("unknown resource type");
    }
}