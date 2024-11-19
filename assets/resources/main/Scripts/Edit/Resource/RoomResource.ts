import { resources, SpriteFrame } from "cc";
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
    get icon(): SpriteFrame {
        return resources.get("main/Sprites/room/spriteFrame", SpriteFrame)!;
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