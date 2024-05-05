import { _decorator, Component, EventMouse, Node } from 'cc';
const { ccclass, property, executeInEditMode, playOnFocus } = _decorator;

@ccclass('AssistantController')
@executeInEditMode(true)
@playOnFocus(true)
export class AssistantController extends Component {
    start() {
        console.log(this.node);
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    update(deltaTime: number) {
        
    }

    onMouseDown(e: EventMouse) {
        console.log("fuck");
    }
}


