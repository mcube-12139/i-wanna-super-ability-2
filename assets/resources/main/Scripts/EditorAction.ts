import { ComponentTemplate } from "./ComponentTemplate";
import { EditSceneController } from "./EditSceneController";

export interface EditorAction {
    undo(): void;
    redo(): void;
}

export class EditorActionObjectData {
    x: number;
    y: number;
    prefab: string;
    id: string;
    components: ComponentTemplate[];

    constructor(x: number, y: number, prefab: string, id: string, components: ComponentTemplate[]) {
        this.x = x;
        this.y = y;
        this.prefab = prefab;
        this.id = id;
        this.components = components;
    }
}

export class EditorActionCreateObject implements EditorAction {
    layer: string;
    created: EditorActionObjectData[];

    constructor(layer: string, created: EditorActionObjectData[]) {
        this.layer = layer;
        this.created = created;
    }

    undo() {
        EditSceneController.instance.undoCreateObject(this);
    }

    redo() {
        EditSceneController.instance.redoCreateObject(this);
    }
}

export class EditorActionDeleteObject implements EditorAction {
    layer: string;
    deleted: EditorActionObjectData[];

    constructor(layer: string, deleted: EditorActionObjectData[]) {
        this.layer = layer;
        this.deleted = deleted;
    }

    undo() {
        EditSceneController.instance.undoDeleteObject(this);
    }

    redo() {
        EditSceneController.instance.redoDeleteObject(this);
    }
}

export class EditorActionSelect implements EditorAction {
    before: string[];
    after: string[];

    constructor(before: string[], after: string[]) {
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
    ids: string[];
    movementX: number;
    movementY: number;

    constructor(ids: string[], before: number, after: number) {
        this.ids = ids;
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