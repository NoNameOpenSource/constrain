import fs from "fs";
import path from "path";
import "source-map-support/register";
import { Constraint, CONSTRAINT_TYPE, OPERATOR, UNIT } from "../constraint";
import { DrawableObject } from "../drawable-object";
import { ConstraintGroup } from "../layout-engine";
import { parse, serialize } from "../parser";
import { PROPERTY_TYPE } from "../property-type";

class DrawableObjectMock implements DrawableObject {
    id: string;
    constraintGroup: ConstraintGroup;
    children: DrawableObject[];
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(id: string) {
        this.id = id;
        this.constraintGroup = new ConstraintGroup(this, []);
        this.children = [];
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
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

function getConstraints(
    objects: DrawableObject[],
    dimensions: { top: number; left: number; width: number; height: number; horizontalMargin: number }
) {
    const constraints: Constraint[] = [
        {
            from: {
                object: objects[0],
                propertyType: PROPERTY_TYPE.TOP,
            },
            to: undefined,
            type: CONSTRAINT_TYPE.EQUAL,
            operators: [
                {
                    value: dimensions.top,
                    unit: UNIT.PIXEL,
                    operator: OPERATOR.ADD,
                },
            ],
        },
        {
            from: {
                object: objects[0],
                propertyType: PROPERTY_TYPE.LEFT,
            },
            to: undefined,
            type: CONSTRAINT_TYPE.EQUAL,
            operators: [
                {
                    value: dimensions.left,
                    unit: UNIT.PIXEL,
                    operator: OPERATOR.ADD,
                },
            ],
        },
        {
            from: {
                object: objects[0],
                propertyType: PROPERTY_TYPE.WIDTH,
            },
            to: undefined,
            type: CONSTRAINT_TYPE.EQUAL,
            operators: [
                {
                    value: dimensions.width,
                    unit: UNIT.PIXEL,
                    operator: OPERATOR.ADD,
                },
            ],
        },
        {
            from: {
                object: objects[0],
                propertyType: PROPERTY_TYPE.HEIGHT,
            },
            to: undefined,
            type: CONSTRAINT_TYPE.EQUAL,
            operators: [
                {
                    value: dimensions.height,
                    unit: UNIT.PIXEL,
                    operator: OPERATOR.ADD,
                },
            ],
        },
        {
            from: {
                object: objects[1],
                propertyType: PROPERTY_TYPE.HEIGHT,
            },
            to: {
                object: objects[0],
                propertyType: PROPERTY_TYPE.HEIGHT,
            },
            type: CONSTRAINT_TYPE.EQUAL,
            operators: undefined,
        },
        {
            from: {
                object: objects[1],
                propertyType: PROPERTY_TYPE.WIDTH,
            },
            to: {
                object: objects[0],
                propertyType: PROPERTY_TYPE.WIDTH,
            },
            type: CONSTRAINT_TYPE.EQUAL,
            operators: undefined,
        },
        {
            from: {
                object: objects[1],
                propertyType: PROPERTY_TYPE.LEFT,
            },
            to: {
                object: objects[0],
                propertyType: PROPERTY_TYPE.RIGHT,
            },
            type: CONSTRAINT_TYPE.EQUAL,
            operators: [
                {
                    value: dimensions.horizontalMargin,
                    unit: UNIT.PIXEL,
                    operator: OPERATOR.ADD,
                },
            ],
        },
        {
            from: {
                object: objects[1],
                propertyType: PROPERTY_TYPE.TOP,
            },
            to: {
                object: objects[0],
                propertyType: PROPERTY_TYPE.TOP,
            },
            type: CONSTRAINT_TYPE.EQUAL,
            operators: [
                {
                    value: 0,
                    unit: UNIT.PIXEL,
                    operator: OPERATOR.ADD,
                },
            ],
        },
    ];

    return constraints;
}

async function main() {
    const objects: DrawableObject[] = [new DrawableObjectMock("1"), new DrawableObjectMock("2")];

    const dimensions = {
        top: 10,
        left: 20,
        width: 100,
        height: 200,
        horizontalMargin: 50,
    };
    const constraints = getConstraints(objects, dimensions);

    const filePath = path.join(__dirname, "./constraints.json");

    const data = serialize(constraints);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));

    const fileBuf = await fs.promises.readFile(path.join(filePath));
    const fileData = JSON.parse(fileBuf.toString());
    const parsedConstraints = parse(fileData, objects);

    const owner = new DrawableObjectMock("owner");

    owner.constraintGroup.addConstraints(parsedConstraints);

    owner.constraintGroup.computeOrder();

    // console.log(JSON.stringify(constraintGroup.constraintsInOrder, null, 2));
    // console.log("constraints in order length", constraintGroup.constraintsInOrder.length);

    owner.constraintGroup.compute();

    if (objects[0].x !== dimensions.left) {
        throw new Error("Object 0 x is incorrect");
    }

    if (objects[0].y !== dimensions.top) {
        throw new Error("Object 0 y is incorrect");
    }

    if (objects[0].width !== dimensions.width) {
        throw new Error("Object 0 width is incorrect");
    }

    if (objects[0].height !== dimensions.height) {
        throw new Error("Object 0 height width is incorrect");
    }

    if (objects[1].width !== dimensions.width) {
        throw new Error("Object 1 width is incorrect");
    }

    if (objects[1].height !== dimensions.height) {
        throw new Error("Object 1 height width is incorrect");
    }

    if (objects[1].x !== dimensions.left + dimensions.width + dimensions.horizontalMargin) {
        throw new Error("Object 1 x is incorrect");
    }

    if (objects[1].y !== dimensions.top) {
        throw new Error("Object 1 y is incorrect");
    }

    console.log("All test passed!");
}

main().catch(console.error);
