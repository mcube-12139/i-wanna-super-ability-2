import { _decorator, Component, director, Prefab, resources, SpriteFrame } from 'cc';
import { SweetGlobal } from './resources/main/Scripts/SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('StartSceneController')
export class StartSceneController extends Component {
    @property(Prefab)
    mainMenuWindowPrefab!: Prefab;
    @property(Prefab)
    selectorPrefab!: Prefab;
    @property(Prefab)
    selectorShadowPrefab!: Prefab;
    @property(Prefab)
    sweetInputPrefab!: Prefab;
    @property(Prefab)
    resourceItemPrefab!: Prefab;

    @property(SpriteFrame)
    unknownSprite!: SpriteFrame;
    @property(SpriteFrame)
    needleUSprite!: SpriteFrame;
    @property(SpriteFrame)
    needleDSprite!: SpriteFrame;
    @property(SpriteFrame)
    expandedSprite!: SpriteFrame;
    @property(SpriteFrame)
    collapsedSprite!: SpriteFrame;
    @property(SpriteFrame)
    roomSprite!: SpriteFrame;
    @property(SpriteFrame)
    nodeSprite!: SpriteFrame;

    start() {
        SweetGlobal.mainMenuWindowPrefab = this.mainMenuWindowPrefab;
        SweetGlobal.selectorPrefab = this.selectorPrefab;
        SweetGlobal.selectorShadowPrefab = this.selectorShadowPrefab;
        SweetGlobal.sweetInputPrefab = this.sweetInputPrefab;
        SweetGlobal.resourceItemPrefab = this.resourceItemPrefab;

        SweetGlobal.unknownSprite = this.unknownSprite;
        SweetGlobal.needleUSprite = this.needleUSprite;
        SweetGlobal.needleDSprite = this.needleDSprite;
        SweetGlobal.expandedSprite = this.expandedSprite;
        SweetGlobal.collapsedSprite = this.collapsedSprite;
        SweetGlobal.roomSprite = this.roomSprite;
        SweetGlobal.nodeSprite = this.nodeSprite;
        
        resources.loadDir("main", (_, __) => {
            director.loadScene("title");
        });
    }
}


