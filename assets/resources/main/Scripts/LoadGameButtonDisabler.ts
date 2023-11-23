import { _decorator, Component, Node } from 'cc';
import { SweetGlobal } from './SweetGlobal';
import { ButtonController } from './ButtonController';
const { ccclass, property } = _decorator;

@ccclass('LoadGameButtonDisabler')
export class LoadGameButtonDisabler extends Component {
    start() {
        if (!SweetGlobal.hasData()) {
            const controller = this.getComponent(ButtonController);
            controller.disableButton();
        }
    }
}


