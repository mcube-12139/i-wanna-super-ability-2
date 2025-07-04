import { _decorator, Component, Enum, Prefab, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

export enum MainMenuOptionId {
    RESOURCE,
    EDIT,
    NODE_TREE,
    NODE
}

@ccclass('MainMenuOptionController')
export class MainMenuOptionController extends Component {
    @property({type: Enum(MainMenuOptionId)})
    optionId!: MainMenuOptionId;
    @property(Label)
    label!: Label;
    @property(Node)
    background!: Node;
    @property(Prefab)
    pagePrefab!: Prefab;
}


