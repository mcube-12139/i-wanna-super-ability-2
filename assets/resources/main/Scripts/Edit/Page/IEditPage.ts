export interface IEditPage {
    title: string;

    open(): void;
    switchOut(): void;
    save(): void;

    undo(): void;
    redo(): void;
}