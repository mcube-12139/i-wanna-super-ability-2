import { _decorator, Camera, Color, Component, find, instantiate, math, Node, Prefab, Rect, sys, UITransform, Vec2, Vec3 } from 'cc';
import { SweetGlobal } from '../SweetGlobal';
import { GridController } from '../GridController';
import { ObjectShadowController } from './ObjectShadowController';
import { MainMenuOptionId } from '../MainMenuOptionController';
import { EditPrefab } from './PrefabData';
import { RegionSelectorController } from '../RegionSelectorController';
import { NodeData } from './NodeData';
import { RoomFile, RoomDataSummary } from '../RoomFile';
import { RoomEditPage } from './Page/RoomEditPage';
import { IEditPage } from './Page/IEditPage';
import { RoomData } from './RoomData';
import { EditInstance } from './EditInstance';
import { EditActionDelete, EditActionDeletedData } from './Action/EditActionDelete';
import { EditActionCreate } from './Action/EditActionCreate';
import { EditActionDrag } from './Action/EditActionDrag';
import { SweetUid } from '../SweetUid';
import { LinkedValue } from './LinkedValue';
import { StageController } from '../StageController';

export class EditData {
    regionSelectorPrefab: Prefab;
    selectorPrefab: Prefab;
    editorExamplePrefab: Prefab;
    camera: Camera;
    windowParent: Node;
    gridNode: Node;
    selectorContainer: Node;
    objectShadow: Node;

    gridController: GridController;
    objectShadowController: ObjectShadowController;

    selectedRegionStartPos = new Vec2(0, 0);
    selectedRegionEndPos = new Vec2(0, 0);
    regionSelectorNode: Node;
    regionSelector: RegionSelectorController;

    nowWindow: Node | null = null;

    pages: IEditPage[];
    nowPage: IEditPage;
    pageParent: Node;
    
    prefabData: EditPrefab[];
    static mainMenuOptionId: MainMenuOptionId;

    createdInstances: EditInstance[];
    deletedInstances: EditActionDeletedData[];
    dragStartPos: Vec2;
    dragEndPos: Vec2;

    static instance: EditData;

    static initData() {
        this.instance = new EditData();
        this.instance.init();
    }

    startCreate() {
        this.createdInstances = [];
    }

    endCreate() {
        if (this.createdInstances.length !== 0) {
            const page = this.nowPage as RoomEditPage;
            page.addAction(new EditActionCreate(page.creatingRoot, this.createdInstances));
        }
    }

    startDelete() {
        this.deletedInstances = [];
    }

    endDelete() {
        if (this.deletedInstances.length !== 0) {
            const page = this.nowPage as RoomEditPage;
            page.addAction(new EditActionDelete(this.deletedInstances));
        }
    }

    startDrag(position: Vec2) {
        this.dragStartPos.set(position);
        this.dragEndPos.set(position);
    }

    dragTo(position: Vec2) {
        const page = this.nowPage as RoomEditPage;

        const movementX = position.x - this.dragEndPos.x;
        const movementY = position.y - this.dragEndPos.y;
        for (const instance of page.selectors.keys()) {
            instance.setPosition(instance.getPosition().add3f(movementX, movementY, 0));
            page.updateSelector(instance);
        }
        this.dragEndPos.set(position);
    }

    endDrag() {
        const page = this.nowPage as RoomEditPage;

        const movementX = this.dragEndPos.x - this.dragStartPos.x;
        const movementY = this.dragEndPos.y - this.dragStartPos.y;
        if (movementX !== 0 || movementY !== 0) {
            page.addAction(new EditActionDrag(Array.from(page.selectors.keys()), new Vec3(movementX, movementY, 0)));
        }
    }

    createRoom(name: string) {
        // 检查房间名是否重复
        /*
        if (this.hasRoom(name)) {
            return {
                ok: false,
                error: "房间名重复"
            };
        }
        */

        const pageNode = new Node();
        pageNode.addComponent(StageController);
        const rootNode = new Node();
        pageNode.addChild(rootNode);
        this.pageParent.addChild(pageNode);

        const root = new EditInstance(
            rootNode,
            new NodeData(
                SweetUid.create(),
                null,
                null,
                new LinkedValue<string>(true, "Root"),
                new LinkedValue<boolean>(true, true),
                new LinkedValue<Rect>(true, new Rect(0, 0, 0, 0)),
                [],
                null,
                []
            ),
            null,
            []
        );

        const data = new RoomData(
            "11111111",
            name,
            new Vec2(32, 32),
            new Color(40, 40, 40, 255),
            true,
            root,
            new Vec2(32, 32),
            new Color(102, 204, 255, 255)
        );

        const page = new RoomEditPage(
            pageNode,
            name,
            data,
            root,
            root,
            this.prefabData[0]
        );
        this.openPage(page);
        page.save();

        return {
            ok: true
        };
    }

    init() {
        this.prefabData = EditPrefab.createData();
        this.pages = [];
        this.nowPage = null;
    }

    initNode(
        camera: Node,
        grid: Node,
        regionSelector: Node,
        objectShadow: Node,
        pageParent: Node,
        windowParent: Node
    ) {
        this.camera = camera.getComponent(Camera);
        this.windowParent = windowParent;
        this.pageParent = pageParent;
        this.gridNode = grid;
        this.objectShadow = objectShadow;
        this.regionSelectorNode = regionSelector;

        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowController);
        this.gridController = this.gridNode.getComponent(GridController);
        this.regionSelector = this.regionSelectorNode.getComponent(RegionSelectorController);

        if (this.nowPage === null) {
            this.toggleWindow("SelectRoomWindow");
        } else {
            // 打开过，只需要重新创建
            this.nowPage.open();
        }
    }

    dispose() {
        EditData.instance = null;
    }

    toggleWindow(prefabName: string) {
        if (this.nowWindow !== null) {
            this.closeWindow();
        }
        const window = SweetGlobal.createByPrefab(prefabName);
        this.windowParent.addChild(window);
        this.nowWindow = window;
        this.objectShadowController.disable();
    }

    closeWindow() {
        this.nowWindow.destroy();
        this.nowWindow = null;
        this.objectShadowController.enable();
    }

    openMainMenuWindow(option: MainMenuOptionId) {
        EditData.mainMenuOptionId = option;
        this.toggleWindow("MainMenuWindow");
    }

    calcRegion(x1: number, y1: number, x2: number, y2: number): Rect {
        let xMin: number;
        let xMax: number;
        let yMin: number;
        let yMax: number;

        if (x2 > x1) {
            xMin = x1;
            xMax = x2;
        } else {
            xMin = x2;
            xMax = x1;
        }
        if (y2 > y1) {
            yMin = y1;
            yMax = y2;
        } else {
            yMin = y2;
            yMax = y1;
        }

        return new Rect(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
    }

    startSelectRegion(position: Vec2) {
        this.regionSelectorNode.active = true;

        this.selectedRegionStartPos.set(position);
    }

    updateSelectRegion(position: Vec2) {
        const page = this.nowPage as RoomEditPage;

        this.selectedRegionEndPos.set(position);
        const rect = this.calcRegion(this.selectedRegionStartPos.x, this.selectedRegionStartPos.y, position.x, position.y);
        const instances = page.getInstancesInterGlobalRect(rect);
        // todo: 显示选择框阴影
        this.regionSelector.setRegion(rect);
    }

    endSelectRegion() {
        const page = this.nowPage as RoomEditPage;

        const rect = this.calcRegion(this.selectedRegionStartPos.x, this.selectedRegionStartPos.y, this.selectedRegionEndPos.x, this.selectedRegionEndPos.y);
        const instances = page.getInstancesInterGlobalRect(rect);
        this.regionSelector.node.destroy();

        page.selectInstances(instances);
    }

    openPage(page: IEditPage) {
        this.pages.push(page);
        
        if (this.nowPage !== null) {
            // 摧毁当前节点
            this.nowPage.switchOut();
        }
        this.nowPage = page;

        page.open();
    }
}

