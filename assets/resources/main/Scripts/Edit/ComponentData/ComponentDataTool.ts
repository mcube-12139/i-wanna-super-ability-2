import { IComponentData } from "./IComponentData";

export class ComponentDataTool {
    static serialize(data: IComponentData): object {
        return {
            type: data.getType(),
            id: data.id,
            prefab: data.prefab?.id ?? null,
            data: data.serializeData()
        };
    }
}