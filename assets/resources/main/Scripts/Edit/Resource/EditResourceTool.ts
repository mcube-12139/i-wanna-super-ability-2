import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";
import { RoomResource } from "./RoomResource";
import { RootResource } from "./RootResource";

export class EditResourceTool {
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
        if (data.type === EditResourceType.ROOT) {
            const children: IEditResource[] = [];
            const resource = new RootResource(data.id, data.name, children);
            for (const childData of data.children) {
                const child = EditResourceTool.deserialize(childData);
                children.push(child);
                child.parent = resource;
            }

            return resource;
        }
        if (data.type === EditResourceType.ROOM) {
            return new RoomResource(data.id, data.name, undefined);
        }

        throw new Error("unknown resource type");
    }
}