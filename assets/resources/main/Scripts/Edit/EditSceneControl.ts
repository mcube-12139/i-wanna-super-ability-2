import { _decorator, Component, Node } from 'cc';
import { EditData } from './EditData';
const { ccclass, property } = _decorator;

@ccclass('EditSceneControl')
export class EditSceneControl extends Component {
    @property(Node)
    camera: Node;
    @property(Node)
    grid: Node;
    @property(Node)
    regionSelector: Node;
    @property(Node)
    objectShadow: Node;
    @property(Node)
    pageParent: Node;
    @property(Node)
    windowParent: Node;

    start() {
        EditData.instance.initNode(this.camera, this.grid, this.regionSelector, this.objectShadow, this.pageParent, this.windowParent);
    }
}
