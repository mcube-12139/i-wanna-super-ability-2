export class DataField<T> {
    modified: boolean;
    value: T;

    constructor(modified: boolean, value: T) {
        this.modified = modified;
        this.value = value;
    }

    static fromFile<T>(data: any, def: T) {
        console.log(data);
        if (!data.modified) {
            return new DataField(false, def);
        } else {
            return new DataField(true, data.value as T);
        }
    }

    get(def: T): T {
        if (!this.modified) {
            return def;
        }
        return this.value;
    }

    set(value: T) {
        this.modified = true;
        this.value = value;
    }

    toFile(): object {
        if (!this.modified) {
            return {
                modified: false
            };
        }
        return {
            modified: true,
            value: this.value
        };
    }
}