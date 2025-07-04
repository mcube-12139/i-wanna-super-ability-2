import { ILinkableFile } from "../ILinkableFile";
import { LinkedArrayData } from "../LinkedArrayData";
import { LinkedData } from "../LinkedData";
import { RectFile } from "../RectFile";
import { IComponentFile } from "./ComponentData/IComponentFile";

export class NodeFile implements ILinkableFile {
    id: string;
    prefab: string | null;
    name: LinkedData<string>;
    active: LinkedData<boolean>;
    contentRect: LinkedData<RectFile>;
    components: LinkedArrayData<IComponentFile>;
    children: LinkedArrayData<NodeFile>;

    constructor(id: string, prefab: string | null, name: LinkedData<string>, active: LinkedData<boolean>, contentRect: LinkedData<RectFile>, components: LinkedArrayData<IComponentFile>, children: LinkedArrayData<NodeFile>) {
        this.id = id;
        this.prefab = prefab;
        this.name = name;
        this.active = active;
        this.contentRect = contentRect;
        this.components = components;
        this.children = children;
    }
}