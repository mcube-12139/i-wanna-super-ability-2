import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum TagId {
    SOLID,
    DEADLY
}

@ccclass('Tag')
export class Tag extends Component {
    private static map = new Map<TagId, Node[]>();

    public static addTagged(tag: TagId, node: Node) {
        if (!this.map.has(tag)) {
            this.map.set(tag, [node]);
        } else {
            this.map.get(tag).push(node);
        }
    }

    public static removeTagged(tag: TagId, node: Node) {
        const nodes = this.map.get(tag);
        nodes.splice(nodes.indexOf(node), 1);
    }

    public static getNode(tag: TagId) {
        return this.map.get(tag)[0];
    }

    public static *iterNodes(tag: TagId) {
        for (const node of this.map.get(tag)) {
            yield node;
        }
    }

    public static getNodeCount(tag: TagId) {
        return this.map.get(tag).length;
    }

    @property({type: [Enum(TagId)]})
    tagSet: TagId[] = [];

    onEnable() {
        for (const tag of this.tagSet) {
            Tag.addTagged(tag, this.node);
        }
    }

    onDisable() {
        for (const tag of this.tagSet) {
            Tag.removeTagged(tag, this.node);
        }
    }
}


