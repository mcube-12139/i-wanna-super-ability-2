import { EditSceneController, LayerData, NodeData } from "./EditSceneController";

export interface EditorAction {
    undo(): void;
    redo(): void;
}

export class EditorActionCreate implements EditorAction {
    layer: LayerData;
    created: NodeData[];

    constructor(layer: LayerData, created: NodeData[]) {
        this.layer = layer;
        this.created = created;
    }

    undo() {
        EditSceneController.undoCreate(this);
    }

    redo() {
        EditSceneController.redoCreate(this);
    }
}

export class EditorActionDeletedObject {
    layer: LayerData;
    object: NodeData;

    constructor(layer: LayerData, object: NodeData) {
        this.layer = layer;
        this.object = object;
    }
}

export class EditorActionDelete implements EditorAction {
    deleted: EditorActionDeletedObject[];

    constructor(deleted: EditorActionDeletedObject[]) {
        this.deleted = deleted;
    }

    undo() {
        EditSceneController.undoDelete(this);
    }

    redo() {
        EditSceneController.redoDelete(this);
    }
}

export class EditorActionSelect implements EditorAction {
    before: NodeData[];
    after: NodeData[];

    constructor(before: NodeData[], after: NodeData[]) {
        this.before = before;
        this.after = after;
    }

    undo(): void {
        EditSceneController.undoSelect(this);
    }

    redo(): void {
        EditSceneController.redoSelect(this);
    }
}

export class EditorActionDrag implements EditorAction {
    objects: NodeData[];
    movementX: number;
    movementY: number;

    constructor(objects: NodeData[], before: number, after: number) {
        this.objects = objects;
        this.movementX = before;
        this.movementY = after;
    }

    undo(): void {
        EditSceneController.undoDrag(this);
    }

    redo(): void {
        EditSceneController.redoDrag(this);
    }
}