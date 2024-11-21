export interface IIdentity<T> {
    id: string;
    prefab?: T;
    createLinked(): T;
    serialize(): any;
}