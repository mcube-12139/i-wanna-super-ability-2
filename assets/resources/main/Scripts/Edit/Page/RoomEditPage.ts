import { Color, sys, Vec2, Node, Rect, instantiate, size } from "cc";
import { EditInstance } from "../EditInstance";
import { EditPrefab } from "../PrefabData";
import { RoomMetadata } from "../../RoomFile";
import { LoopArray, LoopArrayPointer } from "../../LoopArray";
import { IEditPage } from "./IEditPage";
import { SweetDate } from "../../SweetDate";
import { RoomData } from "../RoomData";
import { EditData } from "../EditData";
import { IEditAction } from "../Action/IEditAction";
import { EditActionDeletedData } from "../Action/EditActionDelete";
import { EditActionSelect } from "../Action/EditActionSelect";
import { SelectorController } from "../../SelectorController";

export class RoomEditPage implements IEditPage {
    title: string;

    node: Node;
    data: RoomData;
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
        root: EditInstance,
        creatingRoot: EditInstance,
        nowPrefab: EditPrefab
    ) {
        this.node = node;
        this.title = title;
        this.data = data;
        this.root = root;
        this.creatingRoot = creatingRoot;
        this.nowPrefab = nowPrefab;

        this.actionIndex = this.actions.createPointer();
    }

    open(): void {
        this.node.addChild(this.data.root.node);
    }

    switchOut(): void {
        this.node.active = false;
    }

    save(): void {
        const time = SweetDate.now();
        const metadata = new RoomMetadata(this.data.name, time);

        sys.localStorage.setItem(`editRoomMetadata${this.data.id}`, JSON.stringify(metadata));
        sys.localStorage.setItem(`editRoom${this.data.id}`, JSON.stringify(this.data.serialize()));
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
        this.data.gridSize.set(size);
        EditData.instance.gridController.redraw();
    }

    setGridColor(color: Color) {
        this.data.gridColor.set(color);
        EditData.instance.gridController.redraw();
    }

    setGridVisible(visible: boolean) {
        this.data.gridVisible = visible;
        EditData.instance.gridController.redraw();
    }

    setBackColor(color: Color) {
        this.data.gridColor.set(color);
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
            rect.x + position.x,
            rect.y + position.y,
            rect.width,
            rect.height
        );
        const child = this.creatingRoot.getChildInterRect(targetRect);
        if (child === null) {
            const data = this.nowPrefab.createLinked();
            const instance = EditInstance.fromNodeData(data);
            this.creatingRoot.addChild(instance);
    
            // 保存操作
            EditData.instance.createdInstances.push(instance);
        }
    }

    /**
     * 获取指定位置的物体
     * @param x 
     * @param y 
     * @returns 物体, 不存在则是 null
     */
    getInstanceAt(position: Vec2) {
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

                EditData.instance.deletedInstances.push(new EditActionDeletedData(selectedInstance.parent, selectedInstance.data));
                selectedInstance.destroy();
            }

            this.selectors.clear();
        } else {
            // 该实例未被选中，删除自身即可
            EditData.instance.deletedInstances.push(new EditActionDeletedData(instance.parent, instance.data));
            instance.destroy();
        }
    }

    createSelector(instance: EditInstance) {
        const selector = instantiate(EditData.instance.selectorPrefab);
        EditData.instance.selectorContainer.addChild(selector);
        this.selectors.set(instance, selector);
    }

    updateSelector(instance: EditInstance) {
        if (this.selectors.has(instance)) {
            const selector = this.selectors.get(instance);
            const rect = instance.data.getGlobalRect();

            selector.setPosition(rect.x, rect.y);
            const controller = selector.getComponent(SelectorController);
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

    getUndoAction() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.start) === 1) {
            const pointer = this.actions.createPointer();
            pointer.assign(this.actionIndex);
            pointer.decrease();

            return pointer.get();
        }

        return null;
    }

    getRedoAction() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.next) === -1) {
            return this.actionIndex.get();
        }

        return null;
    }

    undo() {
        if (this.actions.comparePointer(this.actionIndex, this.actions.start) === 1) {
            this.actionIndex.decrease();
            const action = this.actionIndex.get();
            action.undo();
        }
    }
}