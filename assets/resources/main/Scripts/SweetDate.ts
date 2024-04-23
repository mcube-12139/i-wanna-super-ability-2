export class SweetDate {
    static now() {
        const date = new Date();
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${(date.getHours().toString() as any).padStart(2, "0")}:${(date.getMinutes().toString() as any).padStart(2, "0")}:${(date.getSeconds().toString() as any).padStart(2, "0")}`;
    }
}