import { _decorator, Component, director, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc';
import { SweetGlobal } from './resources/main/Scripts/SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('StartSceneController')
export class StartSceneController extends Component {
    @property(Prefab)
    sweetInputPrefab!: Prefab;
    @property(Prefab)
    resourceItemPrefab!: Prefab;
    @property(SpriteFrame)
    expandedSprite!: SpriteFrame;
    @property(SpriteFrame)
    collapsedSprite!: SpriteFrame;
    @property(SpriteFrame)
    roomSprite!: SpriteFrame;

    start() {
        SweetGlobal.sweetInputPrefab = this.sweetInputPrefab;
        SweetGlobal.resourceItemPrefab = this.resourceItemPrefab;
        SweetGlobal.expandedSprite = this.expandedSprite;
        SweetGlobal.collapsedSprite = this.collapsedSprite;
        SweetGlobal.roomSprite = this.roomSprite;
        
        resources.loadDir("main", (_, __) => {
            director.loadScene("title");
        });
    }
}


