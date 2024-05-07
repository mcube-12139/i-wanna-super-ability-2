import { EditSceneController, NodeData } from "./EditSceneController";

export interface EditorAction {
    undo(): void;
    redo(): void;
}

export class EditorActionCreate implements EditorAction {
    layer: string;
    created: NodeData[];

    constructor(layer: string, created: NodeData[]) {
        this.layer = layer;
        this.created = created;
    }

    undo() {
        EditSceneController.instance.undoCreate(this);
    }

    redo() {
        EditSceneController.instance.redoCreate(this);
    }
}

export class EditorActionDelete implements EditorAction {
    layer: string;
    deleted: NodeData[];

    constructor(layer: string, deleted: NodeData[]) {
        this.layer = layer;
        this.deleted = deleted;
    }

    undo() {
        EditSceneController.instance.undoDelete(this);
    }

    redo() {
        EditSceneController.instance.redoDelete(this);
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
        EditSceneController.instance.undoSelect(this);
    }

    redo(): void {
        EditSceneController.instance.redoSelect(this);
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
        EditSceneController.instance.undoDrag(this);
    }

    redo(): void {
        EditSceneController.instance.redoDrag(this);
    }
}