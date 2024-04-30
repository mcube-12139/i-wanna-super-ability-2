import { _decorator, Component, EventMouse, Node } from 'cc';
import { RoomLayerListController } from './RoomLayerListController';
const { ccclass, property } = _decorator;

@ccclass('CreateLayerButtonController')
export class CreateLayerButtonController extends Component {
    @property(Node)
    list: Node;

    start() {
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    onMouseUp(e: EventMouse) {
        const listControl = this.list.getComponent(RoomLayerListController);
        listControl.createItem();
    }
}


