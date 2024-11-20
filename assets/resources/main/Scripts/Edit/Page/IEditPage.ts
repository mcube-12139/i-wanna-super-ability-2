import { Node } from "cc";

export interface IEditPage {
    node: Node;
    title: string;

    open(): void;
    switchOut(): void;
    save(): void;
}