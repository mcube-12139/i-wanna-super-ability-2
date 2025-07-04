import { Color, Vec2, Node, Rect, instantiate, Vec3, UITransform } from "cc";
import { EditInstance } from "../EditInstance";
import { EditPrefab } from "../EditPrefab";
import { LoopArray, LoopArrayPointer } from "../../LoopArray";
import { IEditPage } from "./IEditPage";
import { RoomData } from "../RoomData";
import { Editor } from "../Editor";
import { IEditAction } from "../Action/IEditAction";
import { EditActionDelete, EditActionDeletedData } from "../Action/EditActionDelete";
import { EditActionSelect } from "../Action/EditActionSelect";
import { EditActionCreate } from "../Action/EditActionCreate";
import { EditActionDrag } from "../Action/EditActionDrag";
import { SweetGlobal } from "../../SweetGlobal";

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

        Editor.instance.camera.clearColor = new Color(this.data.color);
        Editor.instance.objectShadowControl.enable();
        Editor.instance.objectShadowControl.setPrefab(this.nowPrefab);
        Editor.instance.gridControl.redraw();
        this.node.active = true;
    }

    switchOut(): void {
        this.node.active = false;
    }

    save(): void {
        this.data.save();
    }

    recover() {
        this.root.recover();
        this.node = new Node();
        this.node.addChild(this.root.node);

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
        Editor.instance.gridControl.redraw();
    }

    setGridColor(color: Color) {
        this.gridColor.set(color);
        Editor.instance.gridControl.redraw();
    }

    setGridVisible(visible: boolean) {
        this.gridVisible = visible;
        Editor.instance.gridControl.redraw();
    }

    setBackColor(color: Color) {
        this.gridColor.set(color);
        Editor.instance.camera.clearColor = color;
    }

    addAction(action: IEditAction) {
        this.actions.next.assign(this.actionIndex);
        this.actions.write(action);
        this.actionIndex.assign(this.actions.next);
    }

    setInstancePosition(instance: EditInstance, position: Vec3) {
        instance.setPosition(position);
        // 设置选择框位置
        if (this.selectors.has(instance)) {
            const rect = instance.data.getGlobalRect()!;
            this.selectors.get(instance)!.setPosition(rect.x - 3, rect.y - 3, position.z);
        }
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
            this.creatingRoot.addChild(instance);
    
            // 保存操作
            Editor.instance.createdInstances.push(instance);
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
    
    /**
     * 删除实例，如果被选中则删除所有选中
     * @param instance 
     */
    deleteInstanceMaybeSelected(instance: EditInstance) {
        if (this.selectors.has(instance)) {
            // 该实例被选中，删除所有选中
            for (const [selectedInstance, selector] of this.selectors.entries()) {
                selector.destroy();

                Editor.instance.deletedInstances.push(new EditActionDeletedData(selectedInstance.parent!, selectedInstance.data));
                selectedInstance.destroy();
            }

            this.selectors.clear();
        } else {
            // 该实例未被选中，删除自身即可
            Editor.instance.deletedInstances.push(new EditActionDeletedData(instance.parent!, instance.data));
            instance.destroy();
        }
    }

    startCreate() {
        Editor.instance.createdInstances = [];
    }

    endCreate() {
        if (Editor.instance.createdInstances.length !== 0) {
            this.addAction(new EditActionCreate(this.creatingRoot, Editor.instance.createdInstances));
        }
    }

    startDelete() {
        Editor.instance.deletedInstances = [];
    }

    endDelete() {
        if (Editor.instance.deletedInstances.length !== 0) {
            this.addAction(new EditActionDelete(Editor.instance.deletedInstances));
        }
    }

    startDrag(position: Vec2) {
        Editor.instance.dragStartPos.set(position);
        Editor.instance.dragEndPos.set(position);
    }

    dragTo(position: Vec2) {
        const movementX = position.x - Editor.instance.dragEndPos.x;
        const movementY = position.y - Editor.instance.dragEndPos.y;
        for (const instance of this.selectors.keys()) {
            this.setInstancePosition(instance, instance.getPosition()!.add3f(movementX, movementY, 0));
        }
        Editor.instance.dragEndPos.set(position);
    }

    endDrag() {
        const movementX = Editor.instance.dragEndPos.x - Editor.instance.dragStartPos.x;
        const movementY = Editor.instance.dragEndPos.y - Editor.instance.dragStartPos.y;
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
        Editor.instance.regionSelector.active = true;

        Editor.instance.selectedRegionStartPos.set(position);
        Editor.instance.regionSelectorControl.clearGraphics();
    }

    updateSelectRegion(position: Vec2) {
        Editor.instance.selectedRegionEndPos.set(position);
        const rect = this.calcRegion(Editor.instance.selectedRegionStartPos.x, Editor.instance.selectedRegionStartPos.y, position.x, position.y);
        const instances = this.getInstancesInterGlobalRect(rect);
        Editor.instance.setSelectorShadowInstances(instances);
        Editor.instance.regionSelectorControl.setRegion(rect);
    }

    endSelectRegion() {
        const rect = this.calcRegion(Editor.instance.selectedRegionStartPos.x, Editor.instance.selectedRegionStartPos.y, Editor.instance.selectedRegionEndPos.x, Editor.instance.selectedRegionEndPos.y);
        const instances = this.getInstancesInterGlobalRect(rect);
        Editor.instance.clearSelectorShadows();
        Editor.instance.regionSelector.active = false;

        this.selectInstances(instances);
    }

    createSelector(instance: EditInstance) {
        const selector = instantiate(SweetGlobal.selectorPrefab);
        Editor.instance.selectorParent.addChild(selector);
        this.selectors.set(instance, selector);
    }

    updateSelector(instance: EditInstance) {
        if (this.selectors.has(instance)) {
            const selector = this.selectors.get(instance)!;
            const rect = instance.data.getGlobalRect()!;

            selector.setPosition(rect.x - 3, rect.y - 3);
            const transform = selector.getComponent(UITransform)!;
            transform.setContentSize(rect.width + 6, rect.height + 6);
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