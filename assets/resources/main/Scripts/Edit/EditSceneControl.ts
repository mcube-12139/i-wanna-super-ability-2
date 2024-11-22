import { _decorator, Camera, Component, Node, Prefab } from 'cc';
import { EditData } from './EditData';
const { ccclass, property } = _decorator;

@ccclass('EditSceneControl')
export class EditSceneControl extends Component {
    @property(Camera)
    camera!: Camera;
    @property(Node)
    grid!: Node;
    @property(Node)
    selectorShadow!: Node;
    @property(Node)
    selectorParent!: Node;
    @property(Node)
    regionSelector!: Node;
    @property(Node)
    objectShadow!: Node;
    @property(Node)
    pageParent!: Node;
    @property(Node)
    windowParent!: Node;

    start() {
        if (EditData.optionalInstance === undefined) {
            EditData.initData({
                camera: this.camera,
                grid: this.grid,
                selectorShadow: this.selectorShadow,
                selectorParent: this.selectorParent,
                objectShadow: this.objectShadow,
                windowParent: this.windowParent,
                regionSelector: this.regionSelector,
                pageParent: this.pageParent
            });
        }
    }
}
