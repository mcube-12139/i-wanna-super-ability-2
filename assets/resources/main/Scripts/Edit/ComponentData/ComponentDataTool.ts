import { ComponentType } from "./ComponentType";
import { IComponentData } from "./IComponentData";
import { SpriteData } from "./SpriteData";
import { TransformData } from "./TransformData";

export class ComponentDataTool {
    static serialize(data: IComponentData): object {
        return {
            type: data.getType(),
            id: data.id,
            prefab: data.prefab?.id ?? null,
            data: data.serializeData()
        };
    }

    static deserialize(data: any): IComponentData {
        if (data.type === ComponentType.TRANSFORM) {
            return TransformData.deserialize(data);
        }
        if (data.type === ComponentType.SPRITE) {
            return SpriteData.deserialize(data);
        }
        
        throw new Error("unknown component type");
    }
}