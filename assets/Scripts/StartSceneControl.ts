import { _decorator, Component, director, Prefab, SpriteFrame } from 'cc';
import { SweetGlobal } from './SweetGlobal';
const { ccclass, property } = _decorator;

@ccclass('StartSceneControl')
export class StartSceneControl extends Component {
    @property(Prefab)
    editWindowPrefab!: Prefab;
    @property(Prefab)
    selectorPrefab!: Prefab;
    @property(Prefab)
    selectorShadowPrefab!: Prefab;
    @property(Prefab)
    sweetInputPrefab!: Prefab;
    @property(Prefab)
    resourceItemPrefab!: Prefab;
    @property(Prefab)
    editPagePrefab!: Prefab;
    @property(Prefab)
    nodeTreePagePrefab!: Prefab;
    @property(Prefab)
    nodePagePrefab!: Prefab;
    @property(Prefab)
    menuOptionPrefab!: Prefab;
    @property(Prefab)
    playerPrefab!: Prefab;
    @property(Prefab)
    bulletPrefab!: Prefab;

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
    nodeSprite!: SpriteFrame;

    start() {
        // sys.localStorage.clear();

        SweetGlobal.editWindowPrefab = this.editWindowPrefab;
        SweetGlobal.selectorPrefab = this.selectorPrefab;
        SweetGlobal.selectorShadowPrefab = this.selectorShadowPrefab;
        SweetGlobal.sweetInputPrefab = this.sweetInputPrefab;
        SweetGlobal.resourceItemPrefab = this.resourceItemPrefab;
        SweetGlobal.editPagePrefab = this.editPagePrefab;
        SweetGlobal.nodeTreePagePrefab = this.nodeTreePagePrefab;
        SweetGlobal.nodePagePrefab = this.nodePagePrefab;
        SweetGlobal.menuOptionPrefab = this.menuOptionPrefab;
        SweetGlobal.playerPrefab = this.playerPrefab;
        SweetGlobal.bulletPrefab = this.bulletPrefab;

        SweetGlobal.unknownSprite = this.unknownSprite;
        SweetGlobal.needleUSprite = this.needleUSprite;
        SweetGlobal.needleDSprite = this.needleDSprite;
        SweetGlobal.expandedSprite = this.expandedSprite;
        SweetGlobal.collapsedSprite = this.collapsedSprite;
        SweetGlobal.nodeSprite = this.nodeSprite;
        
        director.loadScene("game");
    }
}


