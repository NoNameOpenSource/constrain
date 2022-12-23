import { z } from "zod";
import { Constraint } from "./constraint";
import { DrawableObject } from "./drawable-object";

const targetZ = z.object({
    drawableObjectId: z.string(),
    propertyType: z.enum(["top", "right", "bottom", "left", "width", "height"]),
});

const constraintTypeZ = z.enum(["equal", "gte", "lte"]);

const unitZ = z.enum(["px", "%", "em", "rem"]);

const operatorZ = z.object({
    value: z.number(),
    unit: unitZ,
    operator: z.enum(["add"]),
});

const constraintZ = z.object({
    from: targetZ,
    to: targetZ.optional(),
    type: constraintTypeZ,
    operators: z.tuple([operatorZ]).optional(),
});

const fullZ = z.object({
    constraints: z.array(constraintZ),
});

/**
 * @param input JavaScript object parsed from file
 */
export function parse(input: any, drawableObjects: DrawableObject[]) {
    const result = fullZ.parse(input);

    const constraints: Constraint[] = [];
    for (const constraint of result.constraints) {
        const fromObject = drawableObjects.find((obj) => constraint.from.drawableObjectId === obj.id);
        if (!fromObject) throw new Error(`Missing drawable object with id ${constraint.from.drawableObjectId}`);
        const newConstraint: Constraint = {
            from: { object: fromObject, propertyType: constraint.from.propertyType },
            type: constraint.type,
        };

        const operators = constraint.operators;
        if (operators) {
            newConstraint.operators = constraint.operators;
        }

        const to = constraint.to;
        if (to) {
            const toObject = drawableObjects.find((obj) => to.drawableObjectId === obj.id);
            if (!toObject) throw new Error(`Missing drawable object with id ${to.drawableObjectId}`);
            newConstraint.to = { object: toObject, propertyType: to.propertyType };
        }

        constraints.push(newConstraint);
    }

    return constraints;
}

export function serialize(constraints: Constraint[]) {
    const serializedConstraints = [];

    for (const constraint of constraints) {
        const newConstraint: typeof constraintZ._type = {
            from: { drawableObjectId: constraint.from.object.id, propertyType: constraint.from.propertyType },
            type: constraint.type,
        };

        const operators = constraint.operators;
        if (operators) {
            newConstraint.operators = constraint.operators;
        }

        const to = constraint.to;
        if (to) {
            newConstraint.to = { drawableObjectId: to.object.id, propertyType: to.propertyType };
        }

        serializedConstraints.push(newConstraint);
    }

    const result: typeof fullZ._type = {
        constraints: serializedConstraints,
    };

    return result;
}
