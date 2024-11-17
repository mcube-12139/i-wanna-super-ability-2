import { _decorator, Camera, Color, Component, find, instantiate, math, Node, Prefab, Rect, sys, UITransform, Vec2, Vec3 } from 'cc';
import { SweetGlobal } from '../SweetGlobal';
import { GridController } from '../GridController';
import { ObjectShadowController } from '../ObjectShadowController';
import { MainMenuOptionId } from '../MainMenuOptionController';
import { EditorExampleController } from '../EditorExampleController';
import { EditPrefab } from './PrefabData';
import { SelectorController } from '../SelectorController';
import { LoopArray, LoopArrayPointer } from '../LoopArray';
import { SweetDate } from '../SweetDate';
import { RegionSelectorController } from '../RegionSelectorController';
import { NodeData } from './NodeData';
import { LayerData, LayerFile } from '../LayerData';
import { RoomFile, RoomMetadata } from '../RoomFile';
import { ComponentInstance } from '../ComponentInstance';
import { NodeComponents } from '../NodeComponents';
import { RoomEditPage } from './Page/RoomEditPage';
import { IEditPage } from './Page/IEditPage';
import { RoomData } from './RoomData';
import { EditInstance } from './EditInstance';
import { EditActionDelete, EditActionDeletedData } from './Action/EditActionDelete';
import { EditActionCreate } from './Action/EditActionCreate';
import { EditActionDrag } from './Action/EditActionDrag';
import { SweetUid } from '../SweetUid';
import { LinkedValue } from './LinkedValue';
const { ccclass, property } = _decorator;

export class EditData {
    regionSelectorPrefab: Prefab;
    selectorPrefab: Prefab;
    editorExamplePrefab: Prefab;
    regionSelectorContainer: Node;
    camera: Camera;
    windowLayer: Node;
    gridNode: Node;
    selectorContainer: Node;
    objectShadow: Node;

    gridController: GridController;
    objectShadowController: ObjectShadowController;

    selectRegionX: number;
    selectRegionY: number;
    selectRegionEndX: number;
    selectRegionEndY: number;
    regionSelector: RegionSelectorController;

    nowWindow: Node | null = null;

    pages: IEditPage[];
    nowPage: IEditPage;
    pageParent: Node;
    
    prefabData: EditPrefab[];
    static prefabDataMap: Map<string, EditPrefab>;
    static mainMenuOptionId: MainMenuOptionId;

    static roomMetadataList: RoomMetadata[];

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
            EditData.instance.prefabData[0]
        );
        this.openPage(page);
        page.save();

        return {
            ok: true
        };
    }

    init() {
        this.prefabData = EditPrefab.createData();

        this.pageParent = find("Canvas/PageParent");
        this.gridNode = find("Canvas/Grid");
        this.objectShadow = find("Canvas/ObjectShadow");

        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowController);
        this.gridController = this.gridNode.getComponent(GridController);

        this.gridController.redraw();

        if (this.nowPage === null) {
            this.toggleWindow("SelectRoomWindow");
        } else {
            // 打开过，只需要重新创建
            this.rebuildRoom();
        }
    }

    onDisable() {
        EditData.instance = null;
    }

    toggleWindow(prefabName: string) {
        if (this.nowWindow !== null) {
            this.closeWindow();
        }
        const window = SweetGlobal.createByPrefab(prefabName);
        this.windowLayer.addChild(window);
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

    calcRegion(x1: number, y1: number, x2: number, y2: number) {
        let left: number;
        let right: number;
        let top: number;
        let bottom: number;

        if (x2 > x1) {
            left = x1;
            right = x2;
        } else {
            left = x2;
            right = x1;
        }
        if (y2 > this.selectRegionY) {
            top = y1;
            bottom = y2;
        } else {
            top = y2;
            bottom = y1;
        }

        return { left, top, right, bottom };
    }

    startSelectRegion(x: number, y: number) {
        const regionSelectorNode = instantiate(this.regionSelectorPrefab);
        this.regionSelector = regionSelectorNode.getComponent(RegionSelectorController);
        this.regionSelectorContainer.addChild(regionSelectorNode);

        this.selectRegionX = x;
        this.selectRegionY = y;
    }

    updateSelectRegion(x: number, y: number) {
        const { left, top, right, bottom } = this.calcRegion(this.selectRegionX, this.selectRegionY, x, y);
        const objects = EditData.getObjectsInRegion(left, top, right, bottom);
        this.setSelectedObjects(objects);
        this.regionSelector.setRegion(left, top, right, bottom);
    }

    endSelectRegion(x: number, y: number) {
        const { left, top, right, bottom } = this.calcRegion(this.selectRegionX, this.selectRegionY, x, y);
        const objects = EditData.getObjectsInRegion(left, top, right, bottom);
        this.regionSelector.node.destroy();

        EditData.selectObjects(objects);
    }

    rebuildRoom() {
        this.camera.clearColor = new math.Color(EditData.nowRoomBackColor);
        this.objectShadowController.updateSprite();
        this.gridController.redraw();

        // 重新创建层
        for (const layerData of EditData.layers) {
            const layerNode = new Node(layerData.name);
            layerData.node = layerNode;
            layerNode.setPosition(-400, -225);

            let indexBefore = this.node.children.findIndex(v => v.name === "Stage");
            this.node.insertChild(layerNode, indexBefore);

            // 创建节点
            for (const nodeData of layerData.objects) {
                const prefabData = nodeData.prefab;

                const node = EditData.addNode(layerData, prefabData, nodeData.x, nodeData.y);
                nodeData.node = node;
            }
        }

        // 重新创建选择框
        for (const object of EditData.selectedObjects) {
            this.createSelector(object);
            this.updateSelector(object);
        }
    }

    openPage(page: IEditPage) {
        this.pages.push(page);
        
        // 摧毁当前节点
        this.nowPage.switchOut();
        this.nowPage = page;

        page.open();
    }
}

