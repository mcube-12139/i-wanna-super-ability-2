import { EditResourceType } from "./EditResourceType";

export class EditResourceFile {
    id: string;
    type: EditResourceType;
    name: string;
    parentId: string | null;
    previousId: string | null;
    nextId: string | null;

    constructor(id: string, type: EditResourceType, name: string, parentId: string | null, previousId: string | null, nextId: string | null) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.parentId = parentId;
        this.previousId = previousId;
        this.nextId = nextId;
    }
}