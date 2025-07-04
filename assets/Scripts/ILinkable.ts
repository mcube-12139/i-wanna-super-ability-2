import { ILinkableFile } from "./ILinkableFile";

export interface ILinkable<S extends ILinkableFile, T> {
    id: string;
    prefab?: T;
    createLinked(): T;
    serialize(): S;
}