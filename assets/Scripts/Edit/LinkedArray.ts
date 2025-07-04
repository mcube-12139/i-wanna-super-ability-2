import { ILinkable } from "../ILinkable";
import { ILinkableFile } from "../ILinkableFile";
import { LinkedArrayData } from "../LinkedArrayData";

export class LinkedArray<S extends ILinkableFile, T extends ILinkable<S, T>> {
    modified: boolean;
    values?: T[];
    valueMap?: Map<string, T>;

    constructor(modified: boolean, values: T[] | undefined, valueMap: Map<string, T> | undefined) {
        this.modified = modified;
        this.values = values;
        this.valueMap = valueMap;
    }

    static createLinked<S extends ILinkableFile, T extends ILinkable<S, T>>(values: Iterable<T>): LinkedArray<S, T> {
        const valueMap = new Map<string, T>();
        for (const value of values) {
            valueMap.set(value.id, value.createLinked());
        }

        return new LinkedArray(false, undefined, valueMap);
    }

    static createUnlinked<S extends ILinkableFile, T extends ILinkable<S, T>>(values: Iterable<T>): LinkedArray<S, T> {
        return new LinkedArray(true, Array.from(values), undefined);
    }

    static deserialize<S extends ILinkableFile, T extends ILinkable<S, T>>(data: LinkedArrayData<S>, fun: (value: S) => T): LinkedArray<S, T> {
        if (!data.modified) {
            return new LinkedArray(false, undefined, new Map(data.values.map((value: S) => [value.prefab!, fun(value)])));
        }

        return new LinkedArray(true, data.values.map((value: S) => fun(value)), undefined);
    }

    serialize(): LinkedArrayData<S> {
        if (!this.modified) {
            const values: S[] = [];
            for (const value of this.valueMap!.values()) {
                values.push(value.serialize());
            }
            return {
                modified: false,
                values: values
            };
        }

        return {
            modified: true,
            values: this.values!.map(item => item.serialize())
        };
    }

    *iterValues() {
        if (!this.modified) {
            for (const item of this.valueMap!.values()) {
                yield item;
            }
        } else {
            for (const item of this.values!) {
                yield item;
            }
        }
    }

    *iterLinkedValues(linked: Iterable<T> | undefined) {
        if (!this.modified) {
            for (const item of linked!) {
                const selfValue = this.valueMap!.get(item.id);
                if (selfValue === undefined) {
                    const linked = item.createLinked();
                    this.valueMap!.set(item.id, linked);

                    yield linked;
                } else {
                    yield selfValue;
                }
            }
        } else {
            for (const item of this.values!) {
                yield item;
            }
        }
    }

    push(linked: Iterable<T> | undefined, item: T): void {
        if (!this.modified) {
            // 设定顺序
            this.values = Array.from(linked!);
            this.valueMap = undefined;
            this.modified = true;
        }

        this.values!.push(item);
    }
}