import { EditBox, Label, Node, Sprite, Toggle, instantiate, math, resources } from "cc";

export interface DataType {
    createEditInterface(): Node;
}

export class StringData implements DataType {
    name: string;
    getter: () => string[];
    setter: (value: string) => void;

    constructor(name: string, getter: () => string[], setter: (value: string) => void) {
        this.name = name;
        this.getter = getter;
        this.setter = setter;
    }

    createEditInterface(): Node {
        const node = instantiate(resources.get("main/Prefab/SweetLayoutHor"));

        const labelNode = instantiate(resources.get("main/Prefab/SweetLabel"));
        const label = labelNode.getComponent(Label);
        label.string = this.name;
        node.addChild(labelNode);

        const inputNode = instantiate(resources.get("main/Prefab/SweetInput"));
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
            this.setter(input.string);
        });
        node.addChild(inputNode);

        return node;
    }
}

export class BooleanData implements DataType {
    name: string;
    getter: () => boolean[];
    setter: (value: boolean) => void;

    constructor(name: string, getter: () => boolean[], setter: (value: boolean) => void) {
        this.name = name;
        this.getter = getter;
        this.setter = setter;
    }

    createEditInterface(): Node {
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
            this.setter(toggle.isChecked);
        });
        node.addChild(toggleNode);

        const labelNode = instantiate(resources.get("main/Prefab/SweetLabel"));
        const label = labelNode.getComponent(Label);
        label.string = this.name;
        node.addChild(labelNode);

        return node;
    }
}

export class NumberData implements DataType {
    name: string;
    getter: () => number[];
    setter: (value: number) => void;
    initialText: string;

    constructor(name: string, getter: () => number[], setter: (value: number) => void) {
        this.name = name;
        this.getter = getter;
        this.setter = setter;
    }

    createEditInterface(): Node {
        const node = instantiate(resources.get("main/Prefab/SweetLayoutHor"));

        const labelNode = instantiate(resources.get("main/Prefab/SweetLabel"));
        const label = labelNode.getComponent(Label);
        label.string = this.name;
        node.addChild(labelNode);

        const inputNode = instantiate(resources.get("main/Prefab/SweetInput"));
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
                this.setter(num);
            } else {
                input.string = this.initialText;
            }
        });
        node.addChild(inputNode);

        return node;
    }
}