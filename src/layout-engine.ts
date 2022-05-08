import { Constraint } from "./constraint";
import { DrawableObject } from "./drawable-object";
import { PropertyType } from "./property-type";

export function compute(obj: DrawableObject) {
    if (obj.children.length < 1) {
        return;
    }

    interface Child extends DrawableObject {
        requiresUpdate: boolean;
    }

    const children: Child[] = [];

    const rootNode = obj.constraintGroup.tree;
    rootNode.one;

    // TODO: compute all of the constraints instead of just copying the existing values
    // TODO: only set requiresUpdate to true if x, y, width, or height has changed

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
    owner: DrawableObject;
    constraints: Constraint[];
    constraintsInOrder: Constraint[];
    dirty: boolean;
    tree: Node;

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

    computeOrder() {
        // compute the order
        const objs: DrawableObject[] = [this.owner];

        for (const constraint of this.constraints) {
            if (objs.indexOf(constraint.from.object) === -1) {
                objs.push(constraint.from.object);
            }

            if (!constraint.to) continue;

            if (objs.indexOf(constraint.to.object) === -1) {
                objs.push(constraint.to.object);
            }
        }

        // remove owner
        objs.splice(0, 1);

        const constraints: PossiblyUsedConstraint[] = [];

        // double constraint when there is a "to" DrawableObject
        for (const constraint of this.constraints) {
            constraints.push({
                used: false,
                constraint,
            });
            if (!constraint.to) continue;
            constraints.push({
                used: false,
                constraint: {
                    from: constraint.to,
                    to: constraint.from,
                    type: constraint.type,
                    amount: constraint.amount,
                },
            });
        }

        const mocks: DrawableMock[] = [];

        for (const obj of objs) {
            // find constraints for this obj
            const constraintsWithObject = constraints.filter((constraint) => constraint.constraint.from.object === obj);
            constraints.push(...constraintsWithObject);

            mocks.push({
                x: false,
                y: false,
                constraints,
            });
        }

        const constsInOrder: Constraint[] = [];

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < mocks.length; i++) {
            for (const mock of mocks) {
                // compute x coord

                // check all the dependencies
                let allClear = true;
                for (const cons of mock.constraints) {
                    if (!cons.constraint.to) continue;

                    const xCoordTypes = [PropertyType.LEFT, PropertyType.RIGHT];
                    if (!xCoordTypes.includes(cons.constraint.from.propertyType)) continue;

                    // check if there is a target
                    if (!cons.constraint.to) continue;
                    if (cons.constraint.to.object !== this.owner) continue;

                    // find mock of the object because the constraint depends on the other element's property
                    const dependsOnIndex = objs.indexOf(cons.constraint.to.object);
                    const dependsOnMock = mocks[dependsOnIndex];
                    if (!dependsOnMock.x) {
                        // x coord of the dependence is not computed
                        allClear = false;
                        break;
                    }
                }

                if (allClear) {
                    //TODO:
                    // check if we can compute this
                    // or it is conflicting or ambiguous ( + need ordering)

                    mock.x = true;
                    for (const cons of mock.constraints) {
                        // copy the constraints
                        constsInOrder.push({
                            from: cons.constraint.from,
                            to: cons.constraint.to,
                            type: cons.constraint.type,
                            amount: cons.constraint.amount,
                        });
                    }
                }

                // compute y coord

                // check all the dependencies
                allClear = true;
                for (const cons of mock.constraints) {
                    if (!cons.constraint.to) continue;

                    const yCoordTypes = [PropertyType.TOP, PropertyType.BOTTOM];
                    if (!yCoordTypes.includes(cons.constraint.from.propertyType)) continue;

                    // find mock of the object
                    const targetIndex = objs.indexOf(cons.constraint.to.object);
                    const targetMock = mocks[targetIndex];
                    if (!targetMock.y) {
                        // y coord is not computed
                        allClear = false;
                        break;
                    }
                }

                if (allClear) {
                    //TODO:
                    // check if we can compute this
                    // or it is conflicting or ambiguous ( + need ordering)

                    mock.y = true;
                    for (const cons of mock.constraints) {
                        // copy the constraints
                        constsInOrder.push({
                            from: cons.constraint.from,
                            to: cons.constraint.to,
                            type: cons.constraint.type,
                            amount: cons.constraint.amount,
                        });
                    }
                }
            }
        }

        for (const mock of mocks) {
            if (!mock.x || !mock.y) {
                // error!
                // something not computed
                this.constraintsInOrder = [];
                throw new Error("Bogus OO Error");
            }
        }

        this.constraintsInOrder = constsInOrder;
    }
}

interface Node {
    self: Constraint;
    one: Node;
    two: Node;
}

interface PossiblyUsedConstraint {
    used: boolean;
    constraint: Constraint;
}
