import { EditSceneController } from "./EditSceneController";
import { EditorData } from "./EditorData";

export class EditorAction {
    undo() {}
    redo() {}
}

export class EditorActionObjectData {
    x: number;
    y: number;
    prefab: string;
    id: string;

    constructor(x: number, y: number, prefab: string, id: string) {
        this.x = x;
        this.y = y;
        this.prefab = prefab;
        this.id = id;
    }
}

export class EditorActionCreateObject extends EditorAction {
    layer: string;
    created: EditorActionObjectData[];

    constructor(layer: string, created: EditorActionObjectData[]) {
        super();
        this.layer = layer;
        this.created = created;
    }

    undo() {
        EditorData.undoCreateObject(this);
        EditSceneController.instance.undoCreateObject(this);
    }

    redo() {
        EditorData.redoCreateObject(this);
        EditSceneController.instance.redoCreateObject(this);
    }
}

export class EditorActionDeleteObject extends EditorAction {
    layer: string;
    deleted: EditorActionObjectData[];

    constructor(layer: string, deleted: EditorActionObjectData[]) {
        super();
        this.layer = layer;
        this.deleted = deleted;
    }

    undo() {
        EditorData.undoDeleteObject(this);
        EditSceneController.instance.undoDeleteObject(this);
    }

    redo() {
        EditorData.redoDeleteObject(this);
        EditSceneController.instance.redoDeleteObject(this);
    }
}