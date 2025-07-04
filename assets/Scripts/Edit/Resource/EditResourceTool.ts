import { instantiate, Node, Prefab, resources, sys } from "cc";
import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";
import { NodeResource } from "./NodeResource";
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

    static save(resource: IEditResource): void {
        sys.localStorage.setItem(`edit:resource:${resource.id}`, JSON.stringify(this.serialize(resource)));
    }

    static addChild(resource: IEditResource, child: IEditResource): void {
        if (resource.lastChild !== undefined) {
            resource.lastChild.next = child;
            child.previous = resource.lastChild;

            this.save(resource.lastChild);
        } else {
            resource.firstChild = child;
        }
        resource.lastChild = child;
        child.parent = resource;

        this.save(resource);
        this.save(child);
    }

    static insertBefore(resource: IEditResource, self: IEditResource): void {
        if (self.previous !== undefined) {
            self.previous.next = resource;
            this.save(self.previous);
        } else {
            self.parent!.firstChild = resource;
            this.save(self.parent!);
        }
        resource.previous = self.previous;
        self.previous = resource;
        resource.next = self;
        resource.parent = self.parent;

        this.save(resource);
        this.save(self);
    }

    static findTypeName(resource: IEditResource, type: EditResourceType, name: string): IEditResource | undefined {
        if (resource.type === type && resource.name === name) {
            return resource;
        }

        for (let res = resource.firstChild; res !== undefined; res = res.next) {
            const found = this.findTypeName(res, type, name);
            if (found !== undefined) {
                return found;
            }
        }

        return undefined;
    }

    static serialize(resource: IEditResource): EditResourceFile {
        return new EditResourceFile(
            resource.id,
            resource.type,
            resource.name,
            resource.parent?.id ?? null,
            resource.previous?.id ?? null,
            resource.next?.id ?? null,
        );
    }

    static deserialize(data: EditResourceFile): IEditResource {
        const type = data.type;
        if (type === EditResourceType.ROOT) {
            return new RootResource(data.id, data.name);
        }
        if (type === EditResourceType.NODE) {
            return new NodeResource(data.id, data.name);
        }
        
        throw new Error("unknown resource type");
    }
}