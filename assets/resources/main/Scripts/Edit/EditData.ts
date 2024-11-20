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
import { IEditResource } from './Resource/IEditResource';
import { IComponentData } from './ComponentData/IComponentData';

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
    prefabDataMap: Map<string, EditPrefab>;
    prefabComponentMap: Map<string, IComponentData>;
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
        this.prefabDataMap = new Map(this.prefabData.map(prefab => [prefab.id, prefab]));
        this.prefabComponentMap = new Map();
        for (const prefab of this.prefabData) {
            this.addComponentsToMap(prefab.data);
        }
    }

    static initData(nodes: {
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
            rootResource = new RootResource(SweetUid.create(), "root", []);
        }
        this.optionalInstance = new EditData(nodes, rootResource);

        if (this.instance.nowPage === undefined) {
            this.instance.toggleWindow("MainMenuWindow");
        } else {
            this.instance.nowPage.open();
        }
    }

    addComponentsToMap(data: NodeData) {
        for (const component of data.components) {
            this.prefabComponentMap.set(component.id, component);
        }
        for (const child of data.children) {
            this.addComponentsToMap(child);
        }
    }

    getPrefab(id: string): EditPrefab | undefined {
        return this.prefabDataMap.get(id);
    }

    getComponentPrefab(id: string): IComponentData | undefined {
        return this.prefabComponentMap.get(id);
    }

    saveResource(): void {
        sys.localStorage.setItem("editResources", JSON.stringify(EditResourceTool.serialize(this.rootResource)));
    }

    addResource(resource: IEditResource, parent: IEditResource, before: IEditResource | undefined): void {
        /*
        const pageNode = new Node();
        pageNode.addComponent(StageControl);
        const rootNode = new Node();
        pageNode.addChild(rootNode);
        this.pageParent.addChild(pageNode);
        */

        /*
        const root = new EditInstance(
            rootNode,
            rootData,
            undefined,
            []
        );
        */

        /*
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
        */
        
        // 保存到资源表
        EditResourceTool.insertChild(parent, resource, before);
        this.saveResource();
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

    openPage(resource: IEditResource) {
        const page = resource.createEditPage();

        this.pageParent.addChild(page.node);
        this.pages.push(page);
        
        if (this.nowPage !== undefined) {
            this.nowPage.switchOut();
        }
        this.nowPage = page;

        page.open();
    }
}

