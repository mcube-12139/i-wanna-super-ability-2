import { ComponentType } from "./ComponentType";
import { IComponentData } from "./IComponentData";
import { IComponentDataFile } from "./IComponentDataFile";
import { SpriteData } from "./SpriteData";
import { SpriteDataFile } from "./SpriteDataFile";
import { TransformData } from "./TransformData";
import { TransformDataFile } from "./TransformDataFile";

export class ComponentDataTool {
    static deserialize(data: IComponentDataFile): IComponentData {
        if (data.type === ComponentType.TRANSFORM) {
            return TransformData.deserialize(data as TransformDataFile);
        }
        if (data.type === ComponentType.SPRITE) {
            return SpriteData.deserialize(data as SpriteDataFile);
        }
        
        throw new Error("unknown component type");
    }
}