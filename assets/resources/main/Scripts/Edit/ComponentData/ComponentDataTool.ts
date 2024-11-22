import { ComponentType } from "./ComponentType";
import { IComponentData } from "./IComponentData";
import { IComponentFile } from "./IComponentFile";
import { SpriteData } from "./SpriteData";
import { SpriteDataFile } from "./SpriteFile";
import { TransformData } from "./TransformData";
import { TransformDataFile } from "./TransformFile";

export class ComponentDataTool {
    static deserialize(data: IComponentFile): IComponentData {
        if (data.type === ComponentType.TRANSFORM) {
            return TransformData.deserialize(data as TransformDataFile);
        }
        if (data.type === ComponentType.SPRITE) {
            return SpriteData.deserialize(data as SpriteDataFile);
        }
        
        throw new Error("unknown component type");
    }
}