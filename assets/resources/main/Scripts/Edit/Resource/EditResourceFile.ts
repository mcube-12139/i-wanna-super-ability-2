import { EditResourceType } from "./EditResourceType";

export class EditResourceFile {
    id: string;
    type: EditResourceType;
    name: string;
    children: EditResourceFile[] | null;

    constructor(id: string, type: EditResourceType, name: string, children: EditResourceFile[] | null) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.children = children;
    }
}