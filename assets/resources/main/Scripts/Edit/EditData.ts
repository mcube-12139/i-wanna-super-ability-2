import { Camera, Color, Node, Prefab, Rect, sys, Vec2 } from 'cc';
import { SweetGlobal } from '../SweetGlobal';
import { GridController } from '../GridController';
import { ObjectShadowControl } from './ObjectShadowControl';
import { MainMenuOptionId } from '../MainMenuOptionController';
import { EditPrefab } from './EditPrefab';
import { RegionSelectorController } from '../RegionSelectorController';
import { NodeData } from './NodeData';
import { RoomEditPage } from './Page/RoomEditPage';
import { IEditPage } from './Page/IEditPage';
import { RoomData } from './RoomData';
import { EditInstance } from './EditInstance';
import { EditActionDeletedData } from './Action/EditActionDelete';
import { SweetUid } from '../SweetUid';
import { LinkedValue } from './LinkedValue';
import { StageControl } from './StageControl';
import { SweetDate } from '../SweetDate';
import { RoomResource } from './Resource/RoomResource';
import { EditResourceTool } from './Resource/EditResourceTool';
import { RootResource } from './Resource/RootResource';
import { EditResourceType } from './Resource/EditResourceType';

export class EditData {
    selectorPrefab: Prefab;
    camera: Camera;
    grid: Node;
    gridControl: GridController;
    selectorContainer: Node;

    objectShadow: Node;
    objectShadowController: ObjectShadowControl;

    selectedRegionStartPos = new Vec2(0, 0);
    selectedRegionEndPos = new Vec2(0, 0);
    regionSelector: Node;
    regionSelectorControl: RegionSelectorController;

    windowParent: Node;
    nowWindow?: Node;

    pages: IEditPage[] = [];
    nowPage?: IEditPage;
    pageParent: Node;

    rootResource: RootResource;
    
    prefabData: EditPrefab[];
    static mainMenuOptionId: MainMenuOptionId;

    createdInstances: EditInstance[] = [];
    deletedInstances: EditActionDeletedData[] = [];
    dragStartPos: Vec2 = new Vec2();
    dragEndPos: Vec2 = new Vec2();

    static optionalInstance?: EditData = undefined;
    static get instance(): EditData {
        return this.optionalInstance!;
    }

    constructor(nodes: {
        selectorPrefab: Prefab,
        camera: Camera,
        grid: Node,
        selectorParent: Node,
        objectShadow: Node,
        windowParent: Node,
        regionSelector: Node,
        pageParent: Node
    }, rootResource: RootResource) {
        this.selectorPrefab = nodes.selectorPrefab;
        this.camera = nodes.camera;
        this.grid = nodes.grid;
        this.selectorContainer = nodes.selectorParent;
        this.objectShadow = nodes.objectShadow;
        this.windowParent = nodes.windowParent;
        this.regionSelector = nodes.regionSelector;
        this.pageParent = nodes.pageParent;
        this.rootResource = rootResource;

        this.gridControl = this.grid.getComponent(GridController)!;
        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowControl)!;
        this.regionSelectorControl = this.regionSelector.getComponent(RegionSelectorController)!;

        this.prefabData = EditPrefab.createData();
    }

    static initData(data: {
        selectorPrefab: Prefab,
        camera: Camera,
        grid: Node,
        selectorParent: Node,
        objectShadow: Node,
        windowParent: Node,
        regionSelector: Node,
        pageParent: Node
    }) {
        const rootResourceStr = sys.localStorage.getItem("editResources");
        let rootResource: RootResource;
        if (rootResourceStr !== null) {
            rootResource = EditResourceTool.deserialize(JSON.parse(rootResourceStr)) as RootResource;
        } else {
            rootResource = new RootResource(SweetUid.create(), "untitled", []);
        }
        console.log(rootResource);
        this.optionalInstance = new EditData(data, rootResource);

        if (this.instance.nowPage === undefined) {
            this.instance.toggleWindow("SelectRoomWindow");
        } else {
            // 打开过，只需要重新创建
            this.instance.nowPage.open();
        }
    }

    saveResource(): void {
        sys.localStorage.setItem("editResources", JSON.stringify(EditResourceTool.serialize(this.rootResource)));
    }

    createRoom(name: string) {
        // 检查房间名是否重复
        if (EditResourceTool.findTypeName(this.rootResource, EditResourceType.ROOM, name) !== undefined) {
            return {
                ok: false,
                error: "房间名重复"
            };
        }
        
        const id = SweetUid.create();

        const pageNode = new Node();
        pageNode.addComponent(StageControl);
        const rootNode = new Node();
        pageNode.addChild(rootNode);
        this.pageParent.addChild(pageNode);

        const rootData = new NodeData(
            SweetUid.create(),
            undefined,
            undefined,
            new LinkedValue<string>(true, "Root"),
            new LinkedValue<boolean>(true, true),
            new LinkedValue<Rect>(true, new Rect(0, 0, 0, 0)),
            [],
            undefined,
            []
        );
        const root = new EditInstance(
            rootNode,
            rootData,
            undefined,
            []
        );

        const data = new RoomData(
            id,
            name,
            rootData,
            new Vec2(800, 450),
            new Color(102, 204, 255, 255)
        );

        const page = new RoomEditPage(
            pageNode,
            name,
            data,
            new Vec2(32, 32),
            new Color(40, 40, 40, 255),
            true,
            root,
            root,
            this.prefabData[0]
        );
        this.openPage(page);
        page.save();
        
        // 保存到资源表
        const resourceData = new RoomResource(id, name, this.rootResource);
        EditResourceTool.addChild(this.rootResource, resourceData);
        this.saveResource();

        return {
            ok: true
        };
    }

    dispose() {
        EditData.optionalInstance = undefined;
    }

    toggleWindow(prefabName: string) {
        if (this.nowWindow !== undefined) {
            this.closeWindow();
        }
        const window = SweetGlobal.createByPrefab(prefabName);
        this.windowParent.addChild(window);
        this.nowWindow = window;
        this.objectShadowController.disable();
    }

    closeWindow() {
        if (this.nowWindow !== undefined) {
            this.nowWindow.destroy();
        }
        this.nowWindow = undefined;
        this.objectShadowController.enable();
    }

    openMainMenuWindow(option: MainMenuOptionId) {
        EditData.mainMenuOptionId = option;
        this.toggleWindow("MainMenuWindow");
    }

    openPage(page: IEditPage) {
        this.pages.push(page);
        
        if (this.nowPage !== undefined) {
            this.nowPage.switchOut();
        }
        this.nowPage = page;

        page.open();
    }
}

