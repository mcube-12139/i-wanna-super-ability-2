import { ILinkableFile } from "./ILinkableFile";

export class LinkedArrayData {
    modified: boolean;
    values: ILinkableFile[];

    constructor(modified: boolean, values: ILinkableFile[]) {
        this.modified = modified;
        this.values = values;
    }
}