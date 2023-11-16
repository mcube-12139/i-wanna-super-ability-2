import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum TagId {
    SOLID = 0,
    DEADLY = 1,
    PLAYER = 2,
    PLATFORM = 3,
    BULLET = 4,
}

@ccclass('Tag')
export class Tag extends Component {
    private static map = new Map<TagId, Node[]>();

    private static addTagged(tag: TagId, node: Node) {
        if (!this.map.has(tag)) {
            this.map.set(tag, [node]);
        } else {
            this.map.get(tag).push(node);
        }
    }

    private static removeTagged(tag: TagId, node: Node) {
        const nodes = this.map.get(tag);
        nodes.splice(nodes.indexOf(node), 1);
    }

    /**
     * 获取带指定标签的节点。
     * @param tag 指定标签
     * @returns 获取的节点
     */
    public static getNode(tag: TagId) {
        return this.map.get(tag)[0];
    }

    /**
     * 迭代带指定标签的节点
     * @param tag 指定标签
     */
    public static *iterNodes(tag: TagId) {
        if (this.map.has(tag)) {
            for (const node of this.map.get(tag)) {
                yield node;
            }
        }
    }

    public static hasNode(tag: TagId) {
        return this.getNodeCount(tag) !== 0;
    }

    /**
     * 获取带指定标签的节点数。
     * @param tag 指定标签
     * @returns 节点数量
     */
    public static getNodeCount(tag: TagId) {
        if (!this.map.has(tag)) {
            return 0;
        }
        return this.map.get(tag).length;
    }

    @property({type: [Enum(TagId)]})
    idSet: TagId[] = [];

    onEnable() {
        for (const tag of this.idSet) {
            Tag.addTagged(tag, this.node);
        }
    }

    onDisable() {
        for (const tag of this.idSet) {
            Tag.removeTagged(tag, this.node);
        }
    }
}


