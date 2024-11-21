import { _decorator, Component, Enum, Prefab, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum MainMenuOptionId {
    RESOURCE = 0,
    EDIT = 1,
    ROOM = 2,
    INSTANCE = 3
}

@ccclass('MainMenuOptionController')
export class MainMenuOptionController extends Component {
    @property({type: Enum(MainMenuOptionId)})
    optionId!: MainMenuOptionId;
    @property(Node)
    background!: Node;
    @property(Prefab)
    pagePrefab!: Prefab;
}


