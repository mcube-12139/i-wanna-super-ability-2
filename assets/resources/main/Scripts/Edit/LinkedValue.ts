export class LinkedValue<T> {
    modified: boolean;
    value: T;

    constructor(modified: boolean, value: T) {
        this.modified = modified;
        this.value = value;
    }

    getValue(linked: T): T {
        if (!this.modified) {
            return linked;
        }

        return this.value;
    }

    setValue(value: T) {
        this.modified = true;
        this.value = value;
    }

    clone() {
        return new LinkedValue(this.modified, this.value);
    }

    cloneSpecial(fun: (value: T) => T) {
        return new LinkedValue(this.modified, fun(this.value));
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
            value: fun(this.value)
        } : {
            modified: false
        };
    }
}