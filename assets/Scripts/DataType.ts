import { EditBox, Label, Node, Sprite, Toggle, color, instantiate, math, resources } from "cc";

export abstract class DataType {
    abstract createEditInterface(onChange: () => void): Node;
}

export class StringData extends DataType {
    name: string;
    getter: () => string[];
    setter: (value: string) => void;
    modified: boolean;

    constructor(name: string, getter: () => string[], setter: (value: string) => void, modified: boolean) {
        super();
        this.name = name;
        this.getter = getter;
        this.setter = setter;
        this.modified = modified;
    }

    createEditInterface(onChange: () => void): Node {
        const node = instantiate(resources.get("main/Prefab/SweetLayoutHor"));

        const labelNode = instantiate(resources.get("main/Prefab/SweetLabel"));
        const label = labelNode.getComponent(Label);
        label.string = this.name;
        node.addChild(labelNode);

        const inputNode = instantiate(resources.get("main/Prefab/SweetInput"));
        if (!this.modified) {
            label.color = new math.Color("#A3FF6F");
        }
        const input = inputNode.getComponent(EditBox);
        let initialText = "";
        for (const str of this.getter()) {
            if (initialText === "") {
                initialText = str;
            } else {
                if (initialText !== str) {
                    initialText = "...";
                    break;
                }
            }
        }
        input.string = initialText;
        inputNode.on("editing-did-ended", (input: EditBox) => {
            label.color = math.Color.WHITE;
            this.setter(input.string);
            onChange();
        });
        node.addChild(inputNode);

        return node;
    }
}

export class BooleanData extends DataType {
    name: string;
    getter: () => boolean[];
    setter: (value: boolean) => void;
    modified: boolean;

    constructor(name: string, getter: () => boolean[], setter: (value: boolean) => void, modified: boolean) {
        super();
        this.name = name;
        this.getter = getter;
        this.setter = setter;
        this.modified = modified;
    }

    createEditInterface(onChange: () => void): Node {
        const node = instantiate(resources.get("main/Prefab/SweetLayoutHor"));

        const toggleNode = instantiate(resources.get("main/Prefab/SweetToggle"));
        const toggle = toggleNode.getComponent(Toggle);

        let flag = 0;
        let checked: boolean;
        for (const b of this.getter()) {
            if (flag === 0) {
                flag = 1;
                checked = b;
            } else if (flag === 1) {
                if (b !== checked) {
                    flag = 2;
                    break;
                }
            }
        }
        if (flag === 1) {
            toggle.isChecked = checked;
        } else if (flag === 2) {
            toggle.isChecked = true;
            toggle.checkMark.getComponent(Sprite).color = new math.Color("#FFFFFF7F");
        }

        toggleNode.setPosition(0, -4);
        toggleNode.on("toggle", (toggle: Toggle) => {
            if (toggle.isChecked) {
                toggle.checkMark.getComponent(Sprite).color = new math.Color("#FFFFFF");
            }
            label.color = math.Color.WHITE;
            this.setter(toggle.isChecked);
            onChange();
        });
        node.addChild(toggleNode);

        const labelNode = instantiate(resources.get("main/Prefab/SweetLabel"));
        const label = labelNode.getComponent(Label);
        if (!this.modified) {
            label.color = new math.Color("#A3FF6F");
        }
        label.string = this.name;
        node.addChild(labelNode);

        return node;
    }
}

export class NumberData extends DataType {
    name: string;
    getter: () => number[];
    setter: (value: number) => void;
    modified: boolean;

    initialText: string;

    constructor(name: string, getter: () => number[], setter: (value: number) => void, modified: boolean) {
        super();
        this.name = name;
        this.getter = getter;
        this.setter = setter;
        this.modified = modified;
    }

    createEditInterface(onChange: () => void): Node {
        const node = instantiate(resources.get("main/Prefab/SweetLayoutHor"));

        const labelNode = instantiate(resources.get("main/Prefab/SweetLabel"));
        const label = labelNode.getComponent(Label);
        label.string = this.name;
        node.addChild(labelNode);

        const inputNode = instantiate(resources.get("main/Prefab/SweetInput"));
        if (!this.modified) {
            label.color = new math.Color("#A3FF6F");
        }
        const input = inputNode.getComponent(EditBox);

        let flag = 0;
        let num: number;
        for (const n of this.getter()) {
            if (flag === 0) {
                flag = 1;
                num = n;
            } else if (flag === 1) {
                if (n !== num) {
                    flag = 2;
                    break;
                }
            }
        }
        if (flag === 1) {
            this.initialText = num.toString();
        } else if (flag === 2) {
            this.initialText = "...";
        }
        input.string = this.initialText;

        inputNode.on("editing-did-ended", (input: EditBox) => {
            const num = parseFloat(input.string);
            if (!isNaN(num)) {
                label.color = math.Color.WHITE;
                this.setter(num);
                onChange();
            } else {
                input.string = this.initialText;
            }
        });
        node.addChild(inputNode);

        return node;
    }
}