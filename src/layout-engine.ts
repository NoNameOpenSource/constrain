import { Constraint } from "./constraint";
import { DrawableObject } from "./drawable-object";
import { PropertyType } from "./property-type";

import * as kiwi from "@lume/kiwi";
import { ConstraintObject } from "./constraint-object";
import { Rect } from "./Rect";

//const solver = new kiwi.Solver();

// Create edit variables
//const left = new kiwi.Variable();
//const width = new kiwi.Variable();
//solver.addEditVariable(left, kiwi.Strength.strong);
//solver.addEditVariable(width, kiwi.Strength.strong);
//solver.suggestValue(left, 100);
//solver.suggestValue(width, 400);

// Create and add a constraint
const right = new kiwi.Variable();
//solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, right], left, width), kiwi.Operator.Eq));

// Solve the constraints
//solver.updateVariables();

console.assert(right.value() === 500);

export function compute(obj: DrawableObject) {
    if (obj.children.length < 1) {
        return;
    }

    interface Child extends DrawableObject {
        requiresUpdate: boolean;
    }

    const children: Child[] = [];

    // TODO: compute all of the constraints instead of just copying the existing values
    // TODO: only set requiresUpdate to true if x, y, width, or height has changed

    // for (const constraint of obj.constraintGroup.constraintsInOrder) {
    // convert constraints to x, y, width, height for each child
    // const child = obj.children[constraint.from.object.id];

    // }

    for (const child of obj.children) {
        children.push({
            ...child,
            requiresUpdate: true,
        });
    }

    const atLeastOneChildWillBeUpdated = children.some((child) => child.requiresUpdate);
    if (atLeastOneChildWillBeUpdated) {
        // give the DrawableObject a chance to stop propagation
        // TODO: is this necessary if child.update is responsible for calling compute again?
        if (!obj.atLeastOneChildWillBeUpdated()) {
            return;
        }
    }

    const promises = [];

    for (const child of children) {
        if (child.requiresUpdate) {
            const promise = child.update({
                x: child.x,
                y: child.y,
                width: child.width,
                height: child.height,
            });
            promises.push(promise);
        }
    }

    return Promise.allSettled(promises);
}

/**
 * @todo should this be exported?
 */
/*
export function computeOrder(set: ConstraintGroup) {
    const constraints: Constraint[] = [...set.constraints];
    // TODO: order the `constraints` array

    const newSet: ConstraintGroup = {
        constraints,
        dirty: false,
        tree: undefined,
    };
    return newSet;
}
*/
interface DrawableMock {
    x: boolean;
    y: boolean;
    constraints: PossiblyUsedConstraint[];
}

// add description
// maybe better to implement linear system solver using linear programming in the future
// but now we are making simple program that will work

export class ConstraintGroup {
    owner!: DrawableObject;
    constraints: Constraint[];
    dirty!: boolean;
    objects: ConstraintObject[] = [];
    solver!: kiwi.Solver;

    constructor(constraints: Constraint[]) {
        this.constraints = constraints;

        // compute the order
        this.computeOrder();
    }

    addConstraint(constraint: Constraint) {
        this.constraints.push(constraint);
        this.computeOrder();
    }

    addConstraints(constraints: Constraint[]) {
        this.constraints.push(...constraints);
        this.computeOrder();
    }

    getConstraintObject(drawableObject: DrawableObject): ConstraintObject {
        const object = this.objects.find((object) => {
            if (object.drawableObject === drawableObject) {
                return true;
            }
            return false;
        });

        if (object) {
            return object;
        }

        return this.addConstraintObject(drawableObject);
    }

    addConstraintObject(drawableObject: DrawableObject, strength?: number): ConstraintObject {
        if (strength === undefined || strength === null) {
            strength = kiwi.Strength.medium;
        }

        const object = new ConstraintObject(drawableObject);
        this.solver.addEditVariable(object.kiwiRect.left, strength);
        this.solver.addEditVariable(object.kiwiRect.right, strength);
        this.solver.addEditVariable(object.kiwiRect.top, strength);
        this.solver.addEditVariable(object.kiwiRect.bottom, strength);

        this.objects.push(object);

        return object;
    }

    getVariable(object: ConstraintObject, type: PropertyType): any {
        if (object.drawableObject === this.owner) {
            switch (type) {
                case PropertyType.WIDTH:
                    return object.kiwiRect.left;
                case PropertyType.HEIGHT:
                    return object.kiwiRect.bottom;
            }
        }

        switch (type) {
            case PropertyType.LEFT:
                return object.kiwiRect.left;
            case PropertyType.RIGHT:
                return object.kiwiRect.right;
            case PropertyType.TOP:
                return object.kiwiRect.top;
            case PropertyType.BOTTOM:
                return object.kiwiRect.bottom;
            case PropertyType.WIDTH:
                //return new kiwi.Expression(object.kiwiRect.right, [-1, object.kiwiRect.left]);
                return [object.kiwiRect.right, [-1, object.kiwiRect.left]];
            case PropertyType.HEIGHT:
                //return new kiwi.Expression(object.kiwiRect.bottom, [-1, object.kiwiRect.top]);
                return [object.kiwiRect.bottom, [-1, object.kiwiRect.top]];
        }
    }

    computeOrder() {
        // generate the list of all objects that we are interacting with

        // clean up first

        this.objects = [];
        this.solver = new kiwi.Solver();

        // temporarily add owner
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ownerConstraintObject = this.addConstraintObject(this.owner, kiwi.Strength.required - 1);

        for (const constraint of this.constraints) {
            const fromObject = this.getConstraintObject(constraint.from.object);
            let expressions: any[] = [];
            const varib = this.getVariable(fromObject, constraint.from.propertyType);
            if (varib.value !== undefined) {
                expressions.push(varib);
            } else {
                expressions = expressions.concat(varib);
            }
            //expressions.push(this.getVariable(fromObject, constraint.from.propertyType));

            if (constraint.to) {
                const toObject = this.getConstraintObject(constraint.to.object);
                const varia = this.getVariable(toObject, constraint.to.propertyType);
                if (varia.value !== undefined) {
                    expressions.push([-1, varia]);
                } else {
                    const expa: any[] = varia;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    expressions.push([-1, new kiwi.Expression(...expa)]);
                }
                //expressions.push([-1, this.getVariable(toObject, constraint.to.propertyType)]);
            }

            if (constraint.amount) {
                //TODO: use unit of the constraint
                expressions.push(-1 * constraint.amount.value);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const expression = new kiwi.Expression(...expressions);
            console.log(JSON.stringify(expressions));
            this.solver.addConstraint(new kiwi.Constraint(expression, kiwi.Operator.Eq));
        }
        console.log("\n\n\n\n");
    }

    compute(rect: Rect) {
        const ownerConstraintObject = this.objects[0];
        this.solver.suggestValue(ownerConstraintObject.kiwiRect.top, 0);
        this.solver.suggestValue(ownerConstraintObject.kiwiRect.right, rect.width);
        this.solver.suggestValue(ownerConstraintObject.kiwiRect.bottom, rect.height);
        this.solver.suggestValue(ownerConstraintObject.kiwiRect.left, 0);

        for (const object of this.objects) {
            if (object.frame.left !== object.kiwiRect.left.value()) {
                this.solver.suggestValue(object.kiwiRect.left, object.frame.left);
            }
            if (object.frame.right !== object.kiwiRect.right.value()) {
                this.solver.suggestValue(object.kiwiRect.right, object.frame.right);
            }
            if (object.frame.top !== object.kiwiRect.top.value()) {
                this.solver.suggestValue(object.kiwiRect.top, object.frame.top);
            }
            if (object.frame.bottom !== object.kiwiRect.bottom.value()) {
                this.solver.suggestValue(object.kiwiRect.bottom, object.frame.bottom);
            }
        }

        this.solver.updateVariables();
        this.updateObjects();
    }

    updateObjects() {
        for (const object of this.objects) {
            object.update();
            console.log(object.frame);
        }
    }
}

interface PossiblyUsedConstraint {
    used: boolean;
    constraint: Constraint;
}
