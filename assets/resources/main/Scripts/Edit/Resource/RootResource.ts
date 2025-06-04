import { IEditPage } from "../Page/IEditPage";
import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";

export class RootResource implements IEditResource {
    id: string;
    get type(): EditResourceType {
        return EditResourceType.ROOT;
    }
    name: string;
    parent: undefined;
    previous?: IEditResource;
    next?: IEditResource;
    firstChild?: IEditResource;
    lastChild?: IEditResource;
    children: IEditResource[] | undefined;
    get icon(): undefined {
        return undefined;
    }
    
    constructor(id: string, name: string, children: IEditResource[]) {
        this.id = id;
        this.name = name;
        this.children = children;
    }
    
    createEditPage(): IEditPage {
        throw new Error("Method not implemented.");
    }
}