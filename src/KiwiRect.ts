import * as kiwi from "@lume/kiwi";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-inferrable-types, no-var
var counter: number = 0;

export class KiwiRect {
    left = new kiwi.Variable("obj" + counter + " left");
    right = new kiwi.Variable("obj" + counter + " right");
    top = new kiwi.Variable("obj" + counter + " top");
    bottom = new kiwi.Variable("obj" + counter + " bottom");

    constructor() {
        counter = counter + 1;
    }
}
