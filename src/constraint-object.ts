import { DrawableObject } from "./drawable-object";
import { KiwiRect } from "./KiwiRect";
import { Rect } from "./Rect";

export class ConstraintObject {
    drawableObject: DrawableObject;

    frame: Rect;

    kiwiRect: KiwiRect = new KiwiRect();

    //constraintVariables: { [name: string]: number } = {};

    constructor(drawableObject: DrawableObject, frame?: Rect) {
        this.drawableObject = drawableObject;

        if (frame) {
            this.frame = frame;
        } else {
            this.frame = new Rect(0, 0, 0, 0);
        }
    }

    update() {
        this.frame.left = this.kiwiRect.left.value();
        this.frame.right = this.kiwiRect.right.value();
        this.frame.top = this.kiwiRect.top.value();
        this.frame.bottom = this.kiwiRect.bottom.value();

        this.drawableObject.x = this.frame.x;
        this.drawableObject.y = this.frame.y;
        this.drawableObject.width = this.frame.width;
        this.drawableObject.height = this.frame.height;
    }
}
