export class SweetUid {
    static create() {
        const arr = new Uint8Array(16);
        window.crypto.getRandomValues(arr);

        return Array.from(arr).map(v => v.toString(16).padStart(2, "0")).join("");
    }
}