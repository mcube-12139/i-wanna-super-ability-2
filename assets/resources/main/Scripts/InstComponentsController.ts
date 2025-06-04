import { _decorator, Component } from 'cc';
import { Editor } from './Edit/Editor';
import { RoomEditPage } from './Edit/Page/RoomEditPage';
const { ccclass, property } = _decorator;

@ccclass('InstComponentsController')
export class InstComponentsController extends Component {
    start() {
        const page = Editor.instance.nowPage as RoomEditPage;

        /*
        const editNode = NodeComponents.createEditInterface(page.selectors.map(v => v.components));
        this.node.addChild(editNode);
        */
    }
}


