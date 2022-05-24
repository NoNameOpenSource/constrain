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

const constraints: Constraint[] = [
    {
        from: {
            object: objects[1],
            propertyType: PropertyType.TOP,
        },
        to: null,
        type: ConstraintType.EQUAL,
        amount: {
            value: 100,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[1],
            propertyType: PropertyType.LEFT,
        },
        to: null,
        type: ConstraintType.EQUAL,
        amount: {
            value: 100,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[1],
            propertyType: PropertyType.WIDTH,
        },
        to: null,
        type: ConstraintType.EQUAL,
        amount: {
            value: 100,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[1],
            propertyType: PropertyType.HEIGHT,
        },
        to: null,
        type: ConstraintType.EQUAL,
        amount: {
            value: 100,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[2],
            propertyType: PropertyType.HEIGHT,
        },
        to: {
            object: objects[1],
            propertyType: PropertyType.HEIGHT,
        },
        type: ConstraintType.EQUAL,
        amount: null,
    },
    {
        from: {
            object: objects[2],
            propertyType: PropertyType.WIDTH,
        },
        to: {
            object: objects[1],
            propertyType: PropertyType.WIDTH,
        },
        type: ConstraintType.EQUAL,
        amount: null,
    },
    {
        from: {
            object: objects[2],
            propertyType: PropertyType.LEFT,
        },
        to: {
            object: objects[1],
            propertyType: PropertyType.RIGHT,
        },
        type: ConstraintType.EQUAL,
        amount: {
            value: 50,
            unit: Unit.PIXEL,
        },
    },
    {
        from: {
            object: objects[2],
            propertyType: PropertyType.TOP,
        },
        to: {
            object: objects[1],
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

console.log(JSON.stringify(constraintGroup.constraintsInOrder, null, 2));
console.log("constraints in order length", constraintGroup.constraintsInOrder.length);
