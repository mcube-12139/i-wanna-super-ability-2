export class LoopArrayPointer<T> {
    array: LoopArray<T>;
    index: number;

    constructor(array: LoopArray<T>) {
        this.array = array;
        this.index = 0;
    }

    set(value: T) {
        this.array.data[this.index] = value;
    }

    get() {
        return this.array.data[this.index];
    }

    assign(other: LoopArrayPointer<T>) {
        this.index = other.index;
    }

    increase() {
        ++this.index;
        if (this.index > this.array.data.length) {
            this.index -= this.array.data.length;
        }
    }

    decrease() {
        --this.index;
        if (this.index < 0) {
            this.index += this.array.data.length;
        }
    }
}

export class LoopArray<T> {
    data: T[];
    start: LoopArrayPointer<T>;
    next: LoopArrayPointer<T>;

    constructor(size: number) {
        this.data = new Array<T>(size);
        this.start = new LoopArrayPointer<T>(this);
        this.next = new LoopArrayPointer<T>(this);
    }

    write(value: T) {
        this.next.set(value);
        this.next.increase();
        if (this.next.index === this.start.index) {
            this.start.increase();
        }
    }

    clear() {
        this.start.index = 0;
        this.next.index = 0;
    }

    createPointer() {
        return new LoopArrayPointer<T>(this);
    }
    
    comparePointer<T>(a: LoopArrayPointer<T>, b: LoopArrayPointer<T>) {
        let aIndex = a.index;
        let bIndex = b.index;

        if (a.index < this.start.index) {
            aIndex += this.data.length;
        }
        if (b.index < this.start.index) {
            bIndex += this.data.length;
        }

        if (aIndex > bIndex) {
            return 1;
        } else if (aIndex === bIndex) {
            return 0;
        } else {
            return -1;
        }
    }
}