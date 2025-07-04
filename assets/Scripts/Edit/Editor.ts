import { Camera, Color, instantiate, Node, Prefab, Rect, sys, UITransform, Vec2, Vec3 } from 'cc';
import { SweetGlobal } from '../SweetGlobal';
import { GridControl } from './GridControl';
import { ObjectShadowControl } from './ObjectShadowControl';
import { MainMenuOptionId } from '../MainMenuOptionController';
import { EditPrefab } from './EditPrefab';
import { RegionSelectorController } from '../RegionSelectorController';
import { NodeData } from './NodeData';
import { IEditPage } from './Page/IEditPage';
import { EditInstance } from './EditInstance';
import { EditActionDeletedData } from './Action/EditActionDelete';
import { SweetUid } from '../SweetUid';
import { EditResourceTool } from './Resource/EditResourceTool';
import { RootResource } from './Resource/RootResource';
import { IEditResource } from './Resource/IEditResource';
import { IComponentData } from './ComponentData/IComponentData';
import { MainMenuWindowControl } from '../MainMenuWindowControl';
import { EditSprite } from './EditSprite';
import { SpriteData } from './ComponentData/SpriteData';
import { TransformData } from './ComponentData/TransformData';
import { LinkedArray } from './LinkedArray';
import { LinkedValue } from './LinkedValue';
import { EditResourceFile } from './Resource/EditResourceFile';

export class Editor {
    optionalCamera?: Camera;
    get camera(): Camera {
        return this.optionalCamera!;
    }

    optionalGrid?: Node;
    get grid(): Node {
        return this.optionalGrid!;
    }
    optionalGridControl?: GridControl;
    get gridControl(): GridControl {
        return this.optionalGridControl!;
    }

    optionalSelectorShadow?: Node;
    get selectorShadow(): Node {
        return this.optionalSelectorShadow!;
    }
    optionalSelectorParent?: Node;
    get selectorParent(): Node {
        return this.optionalSelectorParent!;
    }
    selectorShadowMap = new Map<EditInstance, Node>;

    optionalObjectShadow?: Node;
    get objectShadow(): Node {
        return this.optionalObjectShadow!;
    }
    optionalObjectShadowControl?: ObjectShadowControl;
    get objectShadowControl(): ObjectShadowControl {
        return this.optionalObjectShadowControl!;
    }

    selectedRegionStartPos = new Vec2(0, 0);
    selectedRegionEndPos = new Vec2(0, 0);
    optionalRegionSelector?: Node;
    get regionSelector(): Node {
        return this.optionalRegionSelector!;
    }

    optionalRegionSelectorControl?: RegionSelectorController;
    get regionSelectorControl(): RegionSelectorController {
        return this.optionalRegionSelectorControl!;
    }

    optionalWindowParent?: Node;
    get windowParent(): Node {
        return this.optionalWindowParent!;
    }
    nowWindow?: Node = undefined;

    optionalPageParent?: Node;
    get pageParent(): Node {
        return this.optionalPageParent!;
    }
    pages: IEditPage[] = [];
    nowPage?: IEditPage = undefined;

    resourceIds: string[];
    rootResource: RootResource;
    
    editSprites: EditSprite[];
    editSpritesMap: Map<string, EditSprite>;

    prefabData: EditPrefab[];
    prefabDataMap: Map<string, EditPrefab>;
    prefabComponentMap: Map<string, IComponentData>;

    createdInstances: EditInstance[] = [];
    deletedInstances: EditActionDeletedData[] = [];
    dragStartPos: Vec2 = new Vec2();
    dragEndPos: Vec2 = new Vec2();

    static optionalInstance?: Editor = undefined;
    static get instance(): Editor {
        return this.optionalInstance!;
    }

    constructor() {
        const resourcesStr = sys.localStorage.getItem("edit:resources");
        let resourceIds: string[];
        let rootResource!: RootResource;
        if (resourcesStr !== null) {
            // 读取资源
            resourceIds = JSON.parse(resourcesStr);

            const resourceMap = new Map<string, {
                file: EditResourceFile,
                resource: IEditResource
            }>();
            for (const id of resourceIds) {
                const resourceStr = sys.localStorage.getItem(`edit:resource:${id}`)!;

                const resourceFile = JSON.parse(resourceStr);
                const resource = EditResourceTool.deserialize(resourceFile);
                resourceMap.set(id, {
                    file: resourceFile,
                    resource: resource
                });
            }
            for (const {file, resource} of resourceMap.values()) {
                if (file.parentId === null) {
                    // 设置为根资源
                    rootResource = resource as RootResource;
                } else {
                    // 设置长资源
                    const parentResource = resourceMap.get(file.parentId)!.resource;
                    resource.parent = parentResource;
                    if (file.previousId === null) {
                        // 设置为长资源的首子资源
                        parentResource.firstChild = resource;
                    }
                    if (file.nextId === null) {
                        // 设置为长资源的尾子资源
                        parentResource.lastChild = resource;
                    }
                }

                if (file.previousId !== null) {
                    // 设置前资源
                    resource.previous = resourceMap.get(file.previousId)!.resource;
                }
                if (file.nextId !== null) {
                    // 设置后资源
                    resource.next = resourceMap.get(file.nextId)!.resource;
                }
            }
        } else {
            // 初始化资源
            rootResource = new RootResource(SweetUid.create(), "root");
            resourceIds = [rootResource.id];
            EditResourceTool.save(rootResource);
            sys.localStorage.setItem("edit:resources", JSON.stringify(resourceIds));
        }
        this.rootResource = rootResource;
        this.resourceIds = resourceIds;

        this.editSprites = [
            new EditSprite(
                "18239ebf14aef6b0508c08bd3f27861c",
                "needleU",
                SweetGlobal.needleUSprite
            ),
            new EditSprite(
                "347c4eb373d3a02cd16354f3a28919d2",
                "needleD",
                SweetGlobal.needleDSprite
            )
        ];
        this.editSpritesMap = new Map(this.editSprites.map(item => [item.id, item]));

        this.prefabData = [
            new EditPrefab(
                "ac706ab16550a44ae4280d4cde6b9c78",
                "NeedleU",
                new NodeData(
                    "095869c14e1b7567903a887ae916e532",
                    undefined,
                    undefined,
                    LinkedValue.createUnlinked("NeedleU"),
                    LinkedValue.createUnlinked(true),
                    LinkedValue.createUnlinked(new Rect(-16, -16, 32, 32)),
                    LinkedArray.createUnlinked([
                        new TransformData(
                            "7102e8155d8c10a89ac2febac5d8715f",
                            undefined,
                            LinkedValue.createUnlinked(new Vec3(0, 0, 0)),
                            LinkedValue.createUnlinked(new Vec3(0, 0, 0)),
                            LinkedValue.createUnlinked(new Vec3(1, 1, 1))
                        ),
                        new SpriteData(
                            "f43495bb0cad79c4210ffad2adf80b0d",
                            undefined,
                            LinkedValue.createUnlinked(this.editSprites[0]),
                            LinkedValue.createUnlinked(Color.WHITE.clone())
                        )
                    ] as IComponentData[]),
                    undefined,
                    LinkedArray.createUnlinked([])
                ),
                new Vec2(16, 16)
            ),
            new EditPrefab(
                "cb93bd8078b10890b0ca73648db7ce31",
                "NeedleD",
                new NodeData(
                    "8fe434e89f3669e36ab7b00004ac857a",
                    undefined,
                    undefined,
                    LinkedValue.createUnlinked("NeedleD"),
                    LinkedValue.createUnlinked(true),
                    LinkedValue.createUnlinked(new Rect(-16, -16, 32, 32)),
                    LinkedArray.createUnlinked([
                        new TransformData(
                            "b074d2279d7ec7e6e070b7e047920c08",
                            undefined,
                            LinkedValue.createUnlinked(new Vec3(0, 0, 0)),
                            LinkedValue.createUnlinked(new Vec3(0, 0, 0)),
                            LinkedValue.createUnlinked(new Vec3(1, 1, 1))
                        ),
                        new SpriteData(
                            "ce7650c03604a603ebcef30e905d5577",
                            undefined,
                            LinkedValue.createUnlinked(this.editSprites[1]),
                            LinkedValue.createUnlinked(Color.WHITE.clone())
                        )
                    ] as IComponentData[]),
                    undefined,
                    LinkedArray.createUnlinked([])
                ),
                new Vec2(16, 16)
            ),
            /*
            new EditPrefab("NeedleL", 0, 0, 32, 32, "needle l", "NeedleLayer", []),
            new EditPrefab("NeedleR", 0, 0, 32, 32, "needle r", "NeedleLayer", []),
            new EditPrefab("MiniU", 0, 0, 16, 16, "mini u", "NeedleLayer", []),
            new EditPrefab("MiniD", 0, 0, 16, 16, "mini d", "NeedleLayer", []),
            new EditPrefab("MiniL", 0, 0, 16, 16, "mini l", "NeedleLayer", []),
            new EditPrefab("MiniR", 0, 0, 16, 16, "mini r", "NeedleLayer", []),
            new EditPrefab("Block", 0, 0, 32, 32, "block", "BlockLayer", []),
            new EditPrefab("MiniBlock", 0, 0, 16, 16, "mini block", "BlockLayer", []),
            new EditPrefab("Platform", 0, 0, 32, 16, "platform", "BlockLayer", [
                new PlatformControllerTemplate("0", true),
                new MovementTemplate("1", 0, 0)
            ]),
            new EditPrefab("Fruit", -10, -12, 21, 24, "fruit 0", "FruitLayer", []),
            new EditPrefab("PlayerStart", 0, 0, 32, 32, "player start", "PlayerLayer", []),
            */
        ];
        this.prefabDataMap = new Map(this.prefabData.map(prefab => [prefab.data.id, prefab]));
        this.prefabComponentMap = new Map();
        for (const prefab of this.prefabData) {
            this.addComponentsToMap(prefab.data);
        }
    }

    static dispose() {
        this.optionalInstance = undefined;
    }

    startScene({
        camera,
        grid,
        selectorShadow,
        selectorParent,
        objectShadow,
        windowParent,
        regionSelector,
        pageParent
    }: {
        camera: Camera,
        grid: Node,
        selectorShadow: Node,
        selectorParent: Node,
        objectShadow: Node,
        windowParent: Node,
        regionSelector: Node,
        pageParent: Node
    }) {
        // 恢复节点
        this.optionalCamera = camera;
        this.optionalGrid = grid;
        this.optionalSelectorShadow = selectorShadow,
        this.optionalSelectorParent = selectorParent;
        this.optionalObjectShadow = objectShadow;
        this.optionalWindowParent = windowParent;
        this.optionalRegionSelector = regionSelector;
        this.optionalPageParent = pageParent;

        this.optionalGridControl = this.optionalGrid.getComponent(GridControl)!;
        this.optionalObjectShadowControl = this.optionalObjectShadow.getComponent(ObjectShadowControl)!;
        this.optionalRegionSelectorControl = this.optionalRegionSelector.getComponent(RegionSelectorController)!;
        
        if (this.nowPage === undefined) {
            this.openMainMenuWindow([], MainMenuOptionId.RESOURCE);
        } else {
            this.nowPage.open();
        }
    }

    addResource(parent: IEditResource, resource: IEditResource) {
        EditResourceTool.addChild(parent, resource);
        this.resourceIds.push(resource.id);
        sys.localStorage.setItem("edit:resources", JSON.stringify(this.resourceIds));
    }

    insertResource(resource: IEditResource, before: IEditResource) {
        EditResourceTool.insertBefore(resource, before);
        this.resourceIds.push(resource.id);
        sys.localStorage.setItem("edit:resources", JSON.stringify(this.resourceIds));
    }

    addComponentsToMap(data: NodeData) {
        for (const component of data.components) {
            this.prefabComponentMap.set(component.id, component);
        }
        for (const child of data.children) {
            this.addComponentsToMap(child);
        }
    }

    getSprite(id: string): EditSprite {
        return this.editSpritesMap.get(id)!;
    }

    getPrefab(id: string | undefined): EditPrefab | undefined {
        return id !== undefined ? this.prefabDataMap.get(id) : undefined;
    }

    getComponentPrefab(id: string | undefined): IComponentData | undefined {
        return id === undefined ? undefined : this.prefabComponentMap.get(id);
    }

    setSelectorShadowInstances(instances: EditInstance[]) {
        const set = new Set(instances);

        // 摧毁不在范围内的影子
        for (const [instance, shadow] of this.selectorShadowMap) {
            if (!set.has(instance)) {
                shadow.destroy();
                this.selectorShadowMap.delete(instance);
            }
        }

        for (const instance of instances) {
            // 如果没有影子则创建
            if (!this.selectorShadowMap.has(instance)) {
                const node: Node = instantiate(SweetGlobal.selectorShadowPrefab);
                this.selectorParent.addChild(node);

                const rect = instance.data.getGlobalRect()!;
                node.setPosition(rect.x - 3, rect.y - 3);
                node.getComponent(UITransform)!.setContentSize(rect.width + 6, rect.height + 6);

                this.selectorShadowMap.set(instance, node);
            }
        }
    }

    clearSelectorShadows() {
        for (const shadow of this.selectorShadowMap.values()) {
            shadow.destroy();
        }
        this.selectorShadowMap.clear();
    }

    toggleWindow(prefab: Prefab) {
        if (this.nowWindow !== undefined) {
            this.closeWindow();
        }
        const window = instantiate(prefab);
        this.windowParent.addChild(window);
        this.nowWindow = window;
        this.objectShadowControl.disable();
    }

    closeWindow() {
        if (this.nowWindow !== undefined) {
            this.nowWindow.destroy();
        }
        this.nowWindow = undefined;
        this.objectShadowControl.enable();
    }

    openMainMenuWindow(enabledOptions: MainMenuOptionId[], selectedOption: MainMenuOptionId) {
        this.toggleWindow(SweetGlobal.editWindowPrefab);
        const control = this.nowWindow!.getComponent(MainMenuWindowControl)!;
        control.createOptions(enabledOptions);
        control.toggleOption(selectedOption);
    }

    openPage(resource: IEditResource) {
        const page = resource.createEditPage();

        this.pageParent.addChild(page.node);
        this.pages.push(page);
        
        if (this.nowPage !== undefined) {
            this.nowPage.switchOut();
        }
        this.nowPage = page;

        page.open();
    }
}

