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
import { MainMenuWindowController } from '../MainMenuWindowController';
import { EditSprite } from './EditSprite';
import { SpriteData } from './ComponentData/SpriteData';
import { TransformData } from './ComponentData/TransformData';
import { LinkedArray } from './LinkedArray';
import { LinkedValue } from './LinkedValue';

export class EditData {
    camera: Camera;
    grid: Node;
    gridControl: GridControl;

    selectorShadow: Node;
    selectorParent: Node;
    selectorShadowMap = new Map<EditInstance, Node>;

    objectShadow: Node;
    objectShadowController: ObjectShadowControl;

    selectedRegionStartPos = new Vec2(0, 0);
    selectedRegionEndPos = new Vec2(0, 0);
    regionSelector: Node;
    regionSelectorControl: RegionSelectorController;

    windowParent: Node;
    nowWindow?: Node;

    pageParent: Node;
    pages: IEditPage[] = [];
    nowPage?: IEditPage;

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

    static optionalInstance?: EditData = undefined;
    static get instance(): EditData {
        return this.optionalInstance!;
    }

    constructor(nodes: {
        camera: Camera,
        grid: Node,
        selectorShadow: Node,
        selectorParent: Node,
        objectShadow: Node,
        windowParent: Node,
        regionSelector: Node,
        pageParent: Node
    }, rootResource: RootResource) {
        this.camera = nodes.camera;
        this.grid = nodes.grid;
        this.selectorShadow = nodes.selectorShadow,
        this.selectorParent = nodes.selectorParent;
        this.objectShadow = nodes.objectShadow;
        this.windowParent = nodes.windowParent;
        this.regionSelector = nodes.regionSelector;
        this.pageParent = nodes.pageParent;
        this.rootResource = rootResource;

        this.gridControl = this.grid.getComponent(GridControl)!;
        this.objectShadowController = this.objectShadow.getComponent(ObjectShadowControl)!;
        this.regionSelectorControl = this.regionSelector.getComponent(RegionSelectorController)!;

        this.editSprites = [
            new EditSprite(
                "gdcxldhbojyo9xmpcfhr44typmermhs5",
                "needleU",
                SweetGlobal.needleUSprite
            ),
            new EditSprite(
                "166mzd8ya885uq1q5bpsiamwvk0dlokv",
                "needleD",
                SweetGlobal.needleDSprite
            )
        ];
        this.editSpritesMap = new Map(this.editSprites.map(item => [item.id, item]));

        this.prefabData = [
            new EditPrefab(
                "grmh0qaj7rylfcmlw3qck8mok1efgd3b",
                "NeedleU",
                new NodeData(
                    "wc2oxetf52dvuo3anyudtu8ic14mlz6w",
                    undefined,
                    undefined,
                    LinkedValue.createUnlinked("NeedleU"),
                    LinkedValue.createUnlinked(true),
                    LinkedValue.createUnlinked(new Rect(-16, -16, 32, 32)),
                    LinkedArray.createUnlinked([
                        new TransformData(
                            "solheu50fec5wrdarwje1zo56azm1ru9",
                            undefined,
                            LinkedValue.createUnlinked(new Vec3(0, 0, 0)),
                            LinkedValue.createUnlinked(new Vec3(0, 0, 0)),
                            LinkedValue.createUnlinked(new Vec3(1, 1, 1))
                        ),
                        new SpriteData(
                            "u263duyqzrcwgjrasikjy1i0rb8slopv",
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
                "2ykye086y5pmc7f23k94m7wcgpxwre6a",
                "NeedleD",
                new NodeData(
                    "1tltkz729c9ahwf2dhllzsd94p5j5zsv",
                    undefined,
                    undefined,
                    LinkedValue.createUnlinked("NeedleD"),
                    LinkedValue.createUnlinked(true),
                    LinkedValue.createUnlinked(new Rect(-16, -16, 32, 32)),
                    LinkedArray.createUnlinked([
                        new TransformData(
                            "atc6kn3i9c1htt4r2fn6mxkzvxlj2kwr",
                            undefined,
                            LinkedValue.createUnlinked(new Vec3(0, 0, 0)),
                            LinkedValue.createUnlinked(new Vec3(0, 0, 0)),
                            LinkedValue.createUnlinked(new Vec3(1, 1, 1))
                        ),
                        new SpriteData(
                            "2c28csromzl4t6zkovmrcmklmzu16iln",
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

    static initData(nodes: {
        camera: Camera,
        grid: Node,
        selectorShadow: Node,
        selectorParent: Node,
        objectShadow: Node,
        windowParent: Node,
        regionSelector: Node,
        pageParent: Node
    }) {
        const rootResourceStr = sys.localStorage.getItem("editResources");
        let rootResource: RootResource;
        if (rootResourceStr !== null) {
            rootResource = EditResourceTool.deserialize(JSON.parse(rootResourceStr)) as RootResource;
        } else {
            rootResource = new RootResource(SweetUid.create(), "root", []);
        }
        this.optionalInstance = new EditData(nodes, rootResource);

        if (this.instance.nowPage === undefined) {
            this.instance.openMainMenuWindow(MainMenuOptionId.RESOURCE);
        } else {
            this.instance.nowPage.open();
        }
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

    saveResource(): void {
        sys.localStorage.setItem("editResources", JSON.stringify(EditResourceTool.serialize(this.rootResource)));
    }

    addResource(resource: IEditResource, parent: IEditResource, before: IEditResource | undefined): void {
        // 保存到资源表
        EditResourceTool.insertChild(parent, resource, before);
        this.saveResource();
    }

    dispose() {
        EditData.optionalInstance = undefined;
    }

    toggleWindow(prefab: Prefab) {
        if (this.nowWindow !== undefined) {
            this.closeWindow();
        }
        const window = instantiate(prefab);
        this.windowParent.addChild(window);
        this.nowWindow = window;
        this.objectShadowController.disable();
    }

    closeWindow() {
        if (this.nowWindow !== undefined) {
            this.nowWindow.destroy();
        }
        this.nowWindow = undefined;
        this.objectShadowController.enable();
    }

    openMainMenuWindow(option: MainMenuOptionId) {
        this.toggleWindow(SweetGlobal.mainMenuWindowPrefab);
        this.nowWindow!.getComponent(MainMenuWindowController)!.toggleOption(option);
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

