import { IEditPage } from "../Page/IEditPage";
import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";

export class RootResource implements IEditResource {
    id: string;
    get type(): EditResourceType {
        return EditResourceType.ROOT;
    }
    name: string;
    get parent(): undefined {
        return undefined;
    }
    get previous(): undefined {
        return undefined;
    }
    get next(): undefined {
        return undefined;
    }
    firstChild?: IEditResource = undefined;
    lastChild?: IEditResource = undefined;
    get icon(): undefined {
        return undefined;
    }
    get withChildren(): true {
        return true;
    }
    
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
    
    createEditPage(): IEditPage {
        throw new Error("Method not implemented.");
    }
}