import { _decorator, Component, Node, Toggle } from 'cc';
import { ResourceListControl } from './Edit/ResourceListControl';
import { ButtonController } from './ButtonController';
const { ccclass, property } = _decorator;

@ccclass('ResourcePageControl')
export class ResourcePageControl extends Component {
    @property(ResourceListControl)
    resourceList!: ResourceListControl;
    @property(Toggle)
    enableMultiple!: Toggle;
    @property(ButtonController)
    openButton!: ButtonController;
    @property(ButtonController)
    createRoomButton!: ButtonController;

    start() {
        this.resourceList.init({
            enableMultiple: this.enableMultiple,
            open: this.openButton,
            createRoom: this.createRoomButton
        });
        this.openButton.onTouchEnd((e: TouchEvent) => {

        });
        this.createRoomButton.onTouchEnd((e: TouchEvent) => {

        });
    }

    update(deltaTime: number) {
        
    }
}


