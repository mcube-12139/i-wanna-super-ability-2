import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";

export class RootResource implements IEditResource {
    id: string;
    get type(): EditResourceType {
        return EditResourceType.ROOT;
    }
    name: string;
    parent: undefined;
    children: IEditResource[] | undefined;
    
    constructor(id: string, name: string, children: IEditResource[]) {
        this.id = id;
        this.name = name;
        this.children = children;
    }
}