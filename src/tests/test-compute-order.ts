import "source-map-support/register";
import { Constraint, ConstraintType, Unit } from "../constraint";
import { DrawableObject } from "../drawable-object";
import { ConstraintGroup } from "../layout-engine";
import { PropertyType } from "../property-type";

class DrawableObjectMock implements DrawableObject {
    constraintGroup: ConstraintGroup;
    children: DrawableObject[];
    x: number;
    y: number;
    width: number;
    height: number;

    constructor() {
        this.children = [];
    }

    // eslint-disable-next-line class-methods-use-this
    update() {
        return;
    }

    // eslint-disable-next-line class-methods-use-this
    atLeastOneChildWillBeUpdated() {
        return false;
    }
}

const owner = new DrawableObjectMock();

const objects: DrawableObject[] = [new DrawableObjectMock(), new DrawableObjectMock()];

const TOP = 10;
const LEFT = 20;
const WIDTH = 100;
const HEIGHT = 200;
const HORIZONTAL_MARGIN = 50;

const constraints: Constraint[] = [
    {
        from: {
            object: objects[0],
            propertyType: PropertyType.TOP,
        },
        to: undefined,
        type: ConstraintType.EQUAL,
        amount: {
            value: TOP,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[0],
            propertyType: PropertyType.LEFT,
        },
        to: undefined,
        type: ConstraintType.EQUAL,
        amount: {
            value: LEFT,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[0],
            propertyType: PropertyType.WIDTH,
        },
        to: undefined,
        type: ConstraintType.EQUAL,
        amount: {
            value: WIDTH,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[0],
            propertyType: PropertyType.HEIGHT,
        },
        to: undefined,
        type: ConstraintType.EQUAL,
        amount: {
            value: HEIGHT,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[1],
            propertyType: PropertyType.HEIGHT,
        },
        to: {
            object: objects[0],
            propertyType: PropertyType.HEIGHT,
        },
        type: ConstraintType.EQUAL,
        amount: undefined,
    },
    {
        from: {
            object: objects[1],
            propertyType: PropertyType.WIDTH,
        },
        to: {
            object: objects[0],
            propertyType: PropertyType.WIDTH,
        },
        type: ConstraintType.EQUAL,
        amount: undefined,
    },
    {
        from: {
            object: objects[1],
            propertyType: PropertyType.LEFT,
        },
        to: {
            object: objects[0],
            propertyType: PropertyType.RIGHT,
        },
        type: ConstraintType.EQUAL,
        amount: {
            value: HORIZONTAL_MARGIN,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[1],
            propertyType: PropertyType.TOP,
        },
        to: {
            object: objects[0],
            propertyType: PropertyType.TOP,
        },
        type: ConstraintType.EQUAL,
        amount: {
            value: 0,
            unit: Unit.PIXEL,
        },
    },
];

const constraintGroup = new ConstraintGroup([]);
constraintGroup.owner = owner;
constraintGroup.addConstraints(constraints);

constraintGroup.computeOrder();

// console.log(JSON.stringify(constraintGroup.constraintsInOrder, null, 2));
// console.log("constraints in order length", constraintGroup.constraintsInOrder.length);

constraintGroup.compute();

if (objects[0].x !== LEFT) {
    throw new Error("Object 0 x is incorrect");
}

if (objects[0].y !== TOP) {
    throw new Error("Object 0 y is incorrect");
}

if (objects[0].width !== WIDTH) {
    throw new Error("Object 0 width is incorrect");
}

if (objects[0].height !== HEIGHT) {
    throw new Error("Object 0 height width is incorrect");
}

if (objects[1].width !== WIDTH) {
    throw new Error("Object 1 width is incorrect");
}

if (objects[1].height !== HEIGHT) {
    throw new Error("Object 1 height width is incorrect");
}

if (objects[1].x !== LEFT + WIDTH + HORIZONTAL_MARGIN) {
    throw new Error("Object 1 x is incorrect");
}

if (objects[1].y !== TOP) {
    throw new Error("Object 1 y is incorrect");
}

console.log("All test passed!");
