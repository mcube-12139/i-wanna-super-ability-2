import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ErrorControl')
export class ErrorControl extends Component {
    @property(Label)
    label!: Label;

    time!: number;

    start(): void {
        this.time = 0;
    }

    update(dt: number): void {
        if (this.time > 0) {
            --this.time;
            if (this.time === 0) {
                this.label.string = "";
            }
        }
    }

    show(message: string) {
        this.label.string = message;
        this.time = 180;
    }
}


