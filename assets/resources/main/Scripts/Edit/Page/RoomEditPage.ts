import { Color, sys, Vec2, Node, Rect, instantiate, Vec3 } from "cc";
import { EditInstance } from "../EditInstance";
import { EditPrefab } from "../EditPrefab";
import { LoopArray, LoopArrayPointer } from "../../LoopArray";
import { IEditPage } from "./IEditPage";
import { RoomData } from "../RoomData";
import { EditData } from "../EditData";
import { IEditAction } from "../Action/IEditAction";
import { EditActionDelete, EditActionDeletedData } from "../Action/EditActionDelete";
import { EditActionSelect } from "../Action/EditActionSelect";
import { SelectorController } from "../../SelectorController";
import { EditActionCreate } from "../Action/EditActionCreate";
import { EditActionDrag } from "../Action/EditActionDrag";

export class RoomEditPage implements IEditPage {
    node: Node;
    title: string;

    data: RoomData;

    gridSize: Vec2;
    gridColor: Color;
    gridVisible: boolean;
    root: EditInstance;
    creatingRoot: EditInstance;
    nowPrefab: EditPrefab;

    selectors = new Map<EditInstance, Node>();
    actions = new LoopArray<IEditAction>(64);
    actionIndex: LoopArrayPointer<IEditAction>;

    constructor(
        node: Node,
        title: string,
        data: RoomData,
        gridSize: Vec2,
        gridColor: Color,
        gridVisible: boolean,
        root: EditInstance,
        creatingRoot: EditInstance,
        nowPrefab: EditPrefab
    ) {
        this.node = node;
        this.title = title;
        this.data = data;

        this.gridSize = gridSize;
        this.gridColor = gridColor;
        this.gridVisible = gridVisible;

        this.root = root;
        this.creatingRoot = creatingRoot;
        this.nowPrefab = nowPrefab;

        this.actionIndex = this.actions.createPointer();
    }

    open(): void {
        if (!this.node.isValid) {
            this.recover();
        }

        EditData.instance.camera.clearColor = new Color(this.data.color);
        EditData.instance.objectShadowController.enable();
        EditData.instance.objectShadowController.setPrefab(this.nowPrefab);
        EditData.instance.gridControl.redraw();
        this.node.active = true;
    }

    switchOut(): void {
        this.node.active = false;
    }

    save(): void {
        this.data.save();
    }

    recover() {
        this.node = new Node();
        this.root.recover();

        // 重新创建选择框
        for (const instance of this.selectors.keys()) {
            this.createSelector(instance);
            this.updateSelector(instance);
        }
    }

    rename(name: string) {
        // 检查房间名是否重复
        /*
        if (this.hasRoom(name)) {
            return {
                ok: false,
                error: "房间名重复"
            };
        }
        */

        this.title = name;
        this.data.name = name;
    }

    setGridSize(size: Vec2) {
        this.gridSize.set(size);
        EditData.instance.gridControl.redraw();
    }

    setGridColor(color: Color) {
        this.gridColor.set(color);
        EditData.instance.gridControl.redraw();
    }

    setGridVisible(visible: boolean) {
        this.gridVisible = visible;
        EditData.instance.gridControl.redraw();
    }

    setBackColor(color: Color) {
        this.gridColor.set(color);
        EditData.instance.camera.clearColor = color;
    }

    addAction(action: IEditAction) {
        this.actions.next.assign(this.actionIndex);
        this.actions.write(action);
        this.actionIndex.assign(this.actions.next);
    }

    createInstance(position: Vec2) {
        const rect = this.nowPrefab.data.getContentRect();
        const targetRect = new Rect(
            rect.x + position.x + this.nowPrefab.origin.x,
            rect.y + position.y + this.nowPrefab.origin.y,
            rect.width,
            rect.height
        );
        const child = this.creatingRoot.getChildInterRect(targetRect);
        if (child === undefined) {
            const data = this.nowPrefab.createLinked();
            const instance = EditInstance.fromNodeData(data);
            instance.setPosition(new Vec3(position.x + this.nowPrefab.origin.x, position.y + this.nowPrefab.origin.y, 0));
            console.log(instance);
            console.log(this.creatingRoot);
            this.creatingRoot.addChild(instance);
    
            // 保存操作
            EditData.instance.createdInstances.push(instance);
        }
    }

    /**
     * 获取指定位置的实例
     * @param x 
     * @param y 
     * @returns 实例, 不存在则是 undefined
     */
    getInstanceAt(position: Vec2): EditInstance | undefined {
        return this.root.getInstanceAt(position);
    }

    getInstancesInterGlobalRect(rect: Rect): EditInstance[] {
        return this.root.getChildrenInterGlobalRect(rect);
    }
    
    deleteInstance(instance: EditInstance) {
        if (this.selectors.has(instance)) {
            // 该实例被选中，删除所有选中
            for (const [selectedInstance, selector] of this.selectors.entries()) {
                selector.destroy();

                EditData.instance.deletedInstances.push(new EditActionDeletedData(selectedInstance.parent!, selectedInstance.data));
                selectedInstance.destroy();
            }

            this.selectors.clear();
        } else {
            // 该实例未被选中，删除自身即可
            EditData.instance.deletedInstances.push(new EditActionDeletedData(instance.parent!, instance.data));
            instance.destroy();
        }
    }

    startCreate() {
        EditData.instance.createdInstances = [];
    }

    endCreate() {
        if (EditData.instance.createdInstances.length !== 0) {
            this.addAction(new EditActionCreate(this.creatingRoot, EditData.instance.createdInstances));
        }
    }

    startDelete() {
        EditData.instance.deletedInstances = [];
    }

    endDelete() {
        if (EditData.instance.deletedInstances.length !== 0) {
            this.addAction(new EditActionDelete(EditData.instance.deletedInstances));
        }
    }

    startDrag(position: Vec2) {
        EditData.instance.dragStartPos.set(position);
        EditData.instance.dragEndPos.set(position);
    }

    dragTo(position: Vec2) {
        const movementX = position.x - EditData.instance.dragEndPos.x;
        const movementY = position.y - EditData.instance.dragEndPos.y;
        for (const instance of this.selectors.keys()) {
            instance.setPosition(instance.getPosition()!.add3f(movementX, movementY, 0));
            this.updateSelector(instance);
        }
        EditData.instance.dragEndPos.set(position);
    }

    endDrag() {
        const movementX = EditData.instance.dragEndPos.x - EditData.instance.dragStartPos.x;
        const movementY = EditData.instance.dragEndPos.y - EditData.instance.dragStartPos.y;
        if (movementX !== 0 || movementY !== 0) {
            this.addAction(new EditActionDrag(Array.from(this.selectors.keys()), new Vec3(movementX, movementY, 0)));
        }
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
        EditData.instance.regionSelector.active = true;

        EditData.instance.selectedRegionStartPos.set(position);
    }

    updateSelectRegion(position: Vec2) {
        EditData.instance.selectedRegionEndPos.set(position);
        const rect = this.calcRegion(EditData.instance.selectedRegionStartPos.x, EditData.instance.selectedRegionStartPos.y, position.x, position.y);
        const instances = this.getInstancesInterGlobalRect(rect);
        // todo: 显示选择框阴影
        EditData.instance.regionSelectorControl.setRegion(rect);
    }

    endSelectRegion() {
        const rect = this.calcRegion(EditData.instance.selectedRegionStartPos.x, EditData.instance.selectedRegionStartPos.y, EditData.instance.selectedRegionEndPos.x, EditData.instance.selectedRegionEndPos.y);
        const instances = this.getInstancesInterGlobalRect(rect);
        EditData.instance.regionSelectorControl.node.destroy();

        this.selectInstances(instances);
    }

    createSelector(instance: EditInstance) {
        const selector = instantiate(EditData.instance.selectorPrefab);
        EditData.instance.selectorContainer.addChild(selector);
        this.selectors.set(instance, selector);
    }

    updateSelector(instance: EditInstance) {
        if (this.selectors.has(instance)) {
            const selector = this.selectors.get(instance)!;
            const rect = instance.data.getGlobalRect()!;

            selector.setPosition(rect.x, rect.y);
            const controller = selector.getComponent(SelectorController)!;
            controller.width = rect.width;
            controller.height = rect.height;
        }
    }

    /**
     * 设置被选中物体。代码调用，不记录操作。
     */
    setSelectedInstances(instances: EditInstance[]) {
        const set = new Set(instances);

        // 摧毁多余的选择框
        for (const [selectedInstance, selector] of this.selectors.entries()) {
            if (!set.has(selectedInstance)) {
                selector.destroy();
                this.selectors.delete(selectedInstance);
            }
        }

        for (const instance of instances) {
            if (!this.selectors.has(instance)) {
                this.createSelector(instance);
            }

            this.updateSelector(instance);
        }
    }

    selectInstances(instances: EditInstance[]) {
        // 比较数组相等，不等时才执行
        let different = false;
        if (instances.length !== this.selectors.size) {
            different = true;
        } else {
            for (const instance of instances) {
                if (!this.selectors.has(instance)) {
                    different = true;
                    break;
                }
            }
        }

        if (different) {
            const action = new EditActionSelect(Array.from(this.selectors.keys()), instances);
            this.addAction(action);

            this.setSelectedInstances(instances);
        }
    }

    undo() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.start) === 1) {
            this.actionIndex.decrease();
            const action = this.actionIndex.get();
            action.undo();
        }
    }

    redo() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.next) === -1) {
            const action = this.actionIndex.get();
            action.redo();
            this.actionIndex.increase();
        }
    }
}