import { ILinkableFile } from "./ILinkableFile";

export class LinkedArrayData<T extends ILinkableFile> {
    modified: boolean;
    values: T[];

    constructor(modified: boolean, values: T[]) {
        this.modified = modified;
        this.values = values;
    }
}