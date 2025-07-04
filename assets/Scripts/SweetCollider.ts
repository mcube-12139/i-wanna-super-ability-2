import { _decorator, CCInteger, Component, Enum, Node } from 'cc';
import { Tag, TagId } from './Tag';
const { ccclass, property } = _decorator;

enum SweetColliderType {
    /**
     * 矩形
     */
    RECT = 0,
    /**
     * 使用点阵图
     */
    PRECISE = 1,
    /**
     * 使用多帧点阵图
     */
    PRECISE_PER_FRAME = 2
}

enum SweetColliderBitmapId {
    NONE,
    NEEDLE_U,
    NEEDLE_D,
    NEEDLE_L,
    NEEDLE_R,
    MINI_U,
    MINI_D,
    MINI_L,
    MINI_R,
    FRUIT_0,
    FRUIT_1,
}

@ccclass('SweetCollider')
export class SweetCollider extends Component {
    @property({type: Enum(SweetColliderType)})
    type: SweetColliderType = SweetColliderType.RECT;
    @property(CCInteger)
    top: number = 0;
    @property(CCInteger)
    bottom: number = 0;
    @property(CCInteger)
    left: number = 0;
    @property(CCInteger)
    right: number = 0;
    @property({
        type: Enum(SweetColliderBitmapId),
        visible: function (this: SweetCollider) {
            return this.type === SweetColliderType.PRECISE;
        }
    })
    bitmapId: SweetColliderBitmapId = SweetColliderBitmapId.NONE;
    @property({
        type: [Enum(SweetColliderBitmapId)],
        visible: function (this: SweetCollider) {
            return this.type === SweetColliderType.PRECISE_PER_FRAME;
        }
    })
    bitmapIdList: SweetColliderBitmapId[] = [];

    private static bitmapMap = new Map<SweetColliderBitmapId, Int32Array>([
        [ SweetColliderBitmapId.NEEDLE_U, new Int32Array([98304, 98304, 245760, 245760, 516096, 516096, 1044480, 1044480, 2095104, 2095104, 4193280, 4193280, 8388096, 8388096, 16776960, 16776960, 33554304, 33554304, 67108800, 67108800, 134217696, 134217696, 268435440, 268435440, 536870904, 536870904, 1073741820, 1073741820, 2147483646, 2147483646, -1, -1]) ],
        [ SweetColliderBitmapId.NEEDLE_D, new Int32Array([-1, -1, 2147483646, 2147483646, 1073741820, 1073741820, 536870904, 536870904, 268435440, 268435440, 134217696, 134217696, 67108800, 67108800, 33554304, 33554304, 16776960, 16776960, 8388096, 8388096, 4193280, 4193280, 2095104, 2095104, 1044480, 1044480, 516096, 516096, 245760, 245760, 98304, 98304]) ],
        [ SweetColliderBitmapId.NEEDLE_L, new Int32Array([-1073741824, -268435456, -67108864, -16777216, -4194304, -1048576, -262144, -65536, -16384, -4096, -1024, -256, -64, -16, -4, -1, -1, -4, -16, -64, -256, -1024, -4096, -16384, -65536, -262144, -1048576, -4194304, -16777216, -67108864, -268435456, -1073741824]) ],
        [ SweetColliderBitmapId.NEEDLE_R, new Int32Array([3, 15, 63, 255, 1023, 4095, 16383, 65535, 262143, 1048575, 4194303, 16777215, 67108863, 268435455, 1073741823, -1, -1, 1073741823, 268435455, 67108863, 16777215, 4194303, 1048575, 262143, 65535, 16383, 4095, 1023, 255, 63, 15, 3]) ],
        [ SweetColliderBitmapId.MINI_U, new Int32Array([25166208, 62915520, 132122592, 267390960, 536354808, 1073496060, 2147385342, -1]) ],
        [ SweetColliderBitmapId.MINI_D, new Int32Array([-1, 2147385342, 1073496060, 536354808, 267390960, 132122592, 62915520, 25166208]) ],
        [ SweetColliderBitmapId.MINI_L, new Int32Array([-268386304, -16712704, -983104, -4, -196609, -4128784, -67043584, -1073680384]) ],
        [ SweetColliderBitmapId.MINI_R, new Int32Array([983043, 16711743, 268370943, -49153, 1073741823, 67047423, 4129023, 196623]) ],
        [ SweetColliderBitmapId.FRUIT_0, new Int32Array([458752, 503316720, -33488928, 134209551, -1966082, -536871297, -262145, -268435585, -131073, -134217793, -65537, -234881057, -122881, -1069547773, 1072695295, 129024]) ],
        [ SweetColliderBitmapId.FRUIT_1, new Int32Array([0, 2097021888, -16252944, 134213663, -917505, -268435841, -1, -1, -1, -1, -65537, -234881073, -253953, -1071644927, 266338815, 0]) ],
    ]);

    private bitmap?: Int32Array;
    private bitmapList?: Int32Array[];

    private static getBitmap(id: SweetColliderBitmapId): Int32Array {
        return this.bitmapMap.get(id)!;
    }

    start() {
        // 初始化获取点阵图
        if (this.type === SweetColliderType.PRECISE) {
            this.bitmap = SweetCollider.getBitmap(this.bitmapId);
        } else if (this.type === SweetColliderType.PRECISE_PER_FRAME) {
            this.bitmapList = [];
            for (const [i, id] of this.bitmapIdList.entries()) {
                this.bitmapList.push(SweetCollider.getBitmap(id));
            }
        }
    }

    private bitTrueAt(index: number): boolean {
        const elementIndex = Math.floor(index / 32);
        const bitIndex = index % 32;
        
        return ((this.bitmap!.at(elementIndex)! & (1 << bitIndex)) >> bitIndex) > 0;
    }

    private collideInnerPoint(x: number, y: number): boolean {
        if (this.type === SweetColliderType.RECT) {
            return true;
        }
        if (this.type === SweetColliderType.PRECISE || this.type === SweetColliderType.PRECISE_PER_FRAME) {
            const flippedY = this.top - this.bottom - y - 1;
            return this.bitTrueAt((this.right - this.left) * flippedY + x);
        }

        return false;
    }

    /**
     * 设置 PRECISE_PER_FRAME 类型的点阵图号码。
     * @param index 号码
     */
    public setFrame(index: number) {
        this.bitmap = this.bitmapList![index];
    }

    /**
     * 判断是否在指定位置与带标签节点碰撞。目标节点应该带 SweetCollider 组件。
     * @param tag 指定标签
     * @param x 指定位置 x
     * @param y 指定位置 y
     * @returns 判断结果
     */
    public collideWithTag(tag: TagId, x: number, y: number): boolean {
        for (const _ of this.iterCollidedWithTag(tag, x, y)) {
            return true;
        }

        return false;
    }

    /**
     * 迭代在指定位置碰撞的带标签节点。目标节点应该带 SweetCollider 组件。
     * @param tag 指定标签
     * @param x 指定位置 x
     * @param y 指定位置 y
     */
    public *iterCollidedWithTag(tag: TagId, x: number, y: number) {
        // 遍历带该标签的节点
        const top = Math.round(this.top + y);
        const bottom = Math.round(this.bottom + y);
        const left = Math.round(this.left + x);
        const right = Math.round(this.right + x);

        for (const node of Tag.iterNodes(tag)) {
            const other = node.getComponent(SweetCollider);
            if (other !== null) {
                // 只检查有碰撞器的节点
                
                const otherTop = Math.round(other.top + node.position.y);
                const otherBottom = Math.round(other.bottom + node.position.y);
                const otherLeft = Math.round(other.left + node.position.x);
                const otherRight = Math.round(other.right + node.position.x);

                if (
                    top > otherBottom &&
                    bottom < otherTop &&
                    left < otherRight &&
                    right > otherLeft
                ) {
                    // 矩形区域重叠
                    if (this.type === SweetColliderType.RECT && other.type === SweetColliderType.RECT) {
                        // 双方都是矩形，直接肯定
                        yield node;
                    } else {
                        // 双方不都是矩形，在重叠区内逐点判断
                        const overlappedTop = top < otherTop ? top : otherTop;
                        const overlappedBottom = bottom < otherBottom ? otherBottom : bottom;
                        const overlappedLeft = left < otherLeft ? otherLeft : left;
                        const overlappedRight = right < otherRight ? right : otherRight;

                        for (let i = overlappedLeft; i < overlappedRight; ++i) {
                            for (let j = overlappedBottom; j < overlappedTop; ++j) {
                                if (this.collideInnerPoint(i - left, j - bottom) && other.collideInnerPoint(i - otherLeft, j - otherBottom)) {
                                    yield node;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 向指定方向移动，直到碰撞带标签节点或达到指定最大距离。目标节点应该带 SweetCollider 组件。
     * @param tag 指定标签
     * @param dir 移动方向
     * @param maxDist 最大距离
     */
    public moveContactWithTag(tag: TagId, dir: 0 | 90 | 180 | 270, maxDist: number) {
        let dist = 0;
        // 逐一像素移动
        for ( ; ; ) {
            if (this.collideWithTag(tag, this.node.position.x, this.node.position.y)) {
                // 发生碰撞，如果移动过，返回 1 像素
                if (dist !== 0) {
                    if (dir === 0) {
                        this.node.setPosition(this.node.position.x - 1, this.node.position.y);
                    } else if (dir === 90) {
                        this.node.setPosition(this.node.position.x, this.node.position.y - 1);
                    } else if (dir === 180) {
                        this.node.setPosition(this.node.position.x + 1, this.node.position.y);
                    } else if (dir === 270) {
                        this.node.setPosition(this.node.position.x, this.node.position.y + 1);
                    } 
                }
                break;
            }

            // 达到最大距离，停止
            if (dist >= maxDist) {
                break;
            }
    
            // 前进 1 像素
            if (dir === 0) {
                this.node.setPosition(this.node.position.x + 1, this.node.position.y);
            } else if (dir === 90) {
                this.node.setPosition(this.node.position.x, this.node.position.y + 1);
            } else if (dir === 180) {
                this.node.setPosition(this.node.position.x - 1, this.node.position.y);
            } else if (dir === 270) {
                this.node.setPosition(this.node.position.x, this.node.position.y - 1);
            }
            ++dist;
        }
    }
}


