import { instantiate, Node, Prefab, resources } from "cc";
import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";
import { RoomResource } from "./RoomResource";
import { RootResource } from "./RootResource";
import { ResourceItemControl } from "../ResourceItemControl";
import { EditResourceFile } from "./EditResourceFile";
import { SweetGlobal } from "../../SweetGlobal";

export class EditResourceTool {
    static createItemNode(resource: IEditResource): Node {
        const node = instantiate(SweetGlobal.resourceItemPrefab);
        const control = node.getComponent(ResourceItemControl)!;
        control.setData(resource);

        // 创建子资源节点
        for (let child = resource.firstChild; child !== undefined; child = child.next) {
            const childNode = this.createItemNode(child);
            childNode.getComponent(ResourceItemControl)!.parent = control;
            control.children!.addChild(childNode);
        }

        return node;
    }

    static addChild(resource: IEditResource, child: IEditResource): void {
        if (resource.lastChild !== undefined) {
            resource.lastChild.next = child;
            child.previous = resource.lastChild;
        } else {
            resource.firstChild = child;
        }
        resource.lastChild = child;
        child.parent = resource;
    }

    static insertChild(resource: IEditResource, child: IEditResource, before: IEditResource | undefined): void {
        if (before !== undefined) {
            resource.children!.splice(resource.children!.indexOf(before), 0, child);
        } else {
            resource.children!.push(child);
        }
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

    static serialize(resource: IEditResource): EditResourceFile {
        return new EditResourceFile(
            resource.id,
            resource.type,
            resource.name,
            resource.children?.map(child => this.serialize(child)) ?? null
        );
    }

    static deserialize(data: EditResourceFile): IEditResource {
        const type = data.type;
        if (type === EditResourceType.ROOT) {
            const children: IEditResource[] = [];
            const resource = new RootResource(data.id, data.name, children);
            for (const childData of data.children!) {
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