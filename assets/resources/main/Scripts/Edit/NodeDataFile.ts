import { ILinkableFile } from "../ILinkableFile";
import { LinkedArrayData } from "../LinkedArrayData";
import { LinkedData } from "../LinkedData";
import { RectDataFile } from "../RectDataFile";

export class NodeDataFile implements ILinkableFile {
    id: string;
    prefab: string | null;
    name: LinkedData<string>;
    active: LinkedData<boolean>;
    contentRect: LinkedData<RectDataFile>;
    components: LinkedArrayData;
    children: LinkedArrayData;

    constructor(id: string, prefab: string | null, name: LinkedData<string>, active: LinkedData<boolean>, contentRect: LinkedData<RectDataFile>, components: LinkedArrayData, children: LinkedArrayData) {
        this.id = id;
        this.prefab = prefab;
        this.name = name;
        this.active = active;
        this.contentRect = contentRect;
        this.components = components;
        this.children = children;
    }
}