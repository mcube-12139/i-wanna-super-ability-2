export class LinkedValue<T> {
    modified: boolean;
    value?: T;

    constructor(modified: boolean, value: T | undefined) {
        this.modified = modified;
        this.value = value;
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

    static deserialize<T>(value: any): LinkedValue<T> {
        return new LinkedValue(value.modified, value.value);
    }

    static deserializeSpecial<T>(value: any, fun: (value: any) => T): LinkedValue<T> {
        return new LinkedValue(value.modified, value.modified ? fun(value.value) : undefined);
    }

    serialize(): object {
        return this.modified ? {
            modified: true,
            value: this.value
        } : {
            modified: false
        };
    }

    serializeSpecial(fun: (value: T) => any) {
        return this.modified ? {
            modified: true,
            value: fun(this.value!)
        } : {
            modified: false
        };
    }
}