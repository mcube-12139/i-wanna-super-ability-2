import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";

export class RoomResource implements IEditResource {
    get type(): EditResourceType {
        return EditResourceType.ROOM;
    }

    id: string;
    name: string;
    parent?: IEditResource | undefined;
    get children(): undefined {
        return undefined;
    }
    
    constructor(
        id: string,
        name: string,
        parent: IEditResource | undefined
    ) {
        this.id = id;
        this.name = name;
        this.parent = parent;
    }
}