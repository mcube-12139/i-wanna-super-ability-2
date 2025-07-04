import { Editor } from "../Editor";
import { EditInstance } from "../EditInstance";
import { RoomEditPage } from "../Page/RoomEditPage";
import { IEditAction } from "./IEditAction";

export class EditActionSelect implements IEditAction {
    before: EditInstance[];
    after: EditInstance[];

    constructor(before: EditInstance[], after: EditInstance[]) {
        this.before = before;
        this.after = after;
    }

    undo(): void {
        const page = Editor.instance.nowPage as RoomEditPage;
        page.setSelectedInstances(this.before);
    }

    redo(): void {
        const page = Editor.instance.nowPage as RoomEditPage;
        page.setSelectedInstances(this.after);
    }
}