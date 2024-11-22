import { LinkedData } from "../LinkedData";

export class LinkedValue<T> {
    modified: boolean;
    value?: T;

    constructor(modified: boolean, value: T | undefined) {
        this.modified = modified;
        this.value = value;
    }

    static createLinked<T>() {
        return new LinkedValue<T>(false, undefined);
    }

    static createUnlinked<T>(value: T) {
        return new LinkedValue(true, value);
    }

    getValue(linked: T): T {
        if (!this.modified) {
            return linked;
        }

        return this.value!;
    }

    setValue(value: T) {
        this.modified = true;
        this.value = value;
    }

    clone() {
        return new LinkedValue(this.modified, this.value);
    }

    cloneSpecial(fun: (value: T) => T) {
        return new LinkedValue(this.modified, this.modified ? fun(this.value!) : undefined);
    }

    static deserialize<T>(value: LinkedData<T>): LinkedValue<T> {
        return new LinkedValue(value.modified, value.value);
    }

    static deserializeSpecial<S, T>(value: LinkedData<S>, fun: (value: S) => T): LinkedValue<T> {
        return new LinkedValue(value.modified, value.modified ? fun(value.value!) : undefined);
    }

    serialize(): LinkedData<T> {
        return this.modified ? {
            modified: true,
            value: this.value
        } : {
            modified: false
        };
    }

    serializeSpecial<S>(fun: (value: T) => S): LinkedData<S> {
        return this.modified ? {
            modified: true,
            value: fun(this.value!)
        } : {
            modified: false
        };
    }
}