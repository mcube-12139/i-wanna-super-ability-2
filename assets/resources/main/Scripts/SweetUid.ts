export class SweetUid {
    static create() {
        const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        const result = new Array(32);
        for (let i = 0; i !== 32; ++i) {
            result.push(chars[Math.floor(36 * Math.random())]);
        }

        return result.join("");
    }
}