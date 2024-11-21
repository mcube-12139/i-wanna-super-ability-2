import { ILinkableFile } from "./ILinkableFile";

export interface ILinkable<T> {
    id: string;
    prefab?: T;
    createLinked(): T;
    serialize(): ILinkableFile;
}