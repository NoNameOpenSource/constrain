export class Rect {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setFrame(left: number, right: number, top: number, bottom: number) {
        this.x = left;
        this.y = top;
        this.width = right - left;
        this.height = bottom - top;
    }

    get left() {
        return this.x;
    }

    set left(value: number) {
        this.width += this.x - value;
        this.x = value;
    }

    get right() {
        return this.width + this.x;
    }

    set right(value: number) {
        this.width = value - this.x;
    }

    get top() {
        return this.y;
    }

    set top(value: number) {
        this.height += this.y - value;
        this.y = value;
    }

    get bottom() {
        return this.height + this.y;
    }

    set bottom(value: number) {
        this.height = value - this.y;
    }
}
