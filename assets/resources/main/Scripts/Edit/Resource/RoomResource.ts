import { Color, Rect, resources, SpriteFrame, Vec2, Node } from "cc";
import { EditResourceType } from "./EditResourceType";
import { IEditResource } from "./IEditResource";
import { SweetUid } from "../../SweetUid";
import { LinkedValue } from "../LinkedValue";
import { NodeData } from "../NodeData";
import { RoomData } from "../RoomData";
import { IEditPage } from "../Page/IEditPage";
import { EditInstance } from "../EditInstance";
import { RoomEditPage } from "../Page/RoomEditPage";
import { StageControl } from "../StageControl";
import { EditData } from "../EditData";
import { LinkedArray } from "../LinkedArray";

export class RoomResource implements IEditResource {
    static get icon(): SpriteFrame {
        return resources.get("main/Sprites/room/spriteFrame", SpriteFrame)!;
    }

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
        return RoomResource.icon;
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

    static createResourceAndData(name: string) {
        const id = SweetUid.create();

        const rootData = new NodeData(
            SweetUid.create(),
            undefined,
            undefined,
            new LinkedValue<string>(true, "Root"),
            new LinkedValue<boolean>(true, true),
            new LinkedValue<Rect>(true, new Rect(0, 0, 0, 0)),
            LinkedArray.createUnlinked([]),
            undefined,
            LinkedArray.createUnlinked([])
        );

        const data = new RoomData(
            id,
            name,
            rootData,
            new Vec2(800, 450),
            new Color(148, 191, 255, 255)
        );

        return {
            resource: new RoomResource(id, name, undefined),
            data: data
        }
    }

    createEditPage(): IEditPage {
        const data = RoomData.load(this.id);
        const root = EditInstance.fromNodeData(data.root);

        const pageNode = new Node();
        pageNode.addComponent(StageControl);
        pageNode.addChild(root.node);

        const page = new RoomEditPage(
            pageNode,
            this.name,
            data,
            new Vec2(32, 32),
            new Color(40, 40, 40, 255),
            true,
            root,
            root,
            EditData.instance.prefabData[0]
        );

        return page;
    }
}