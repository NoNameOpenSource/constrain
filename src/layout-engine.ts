import { Constraint, ConstraintType } from "./constraint";
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
        // generate the list of all objects that we are interacting with

        // temporarily add owner
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

        const constraints: PossiblyUsedConstraint[] = this.constraints.map((constraint) => ({
            used: false,
            constraint,
        }));

        /* not using this

        const constraints: PossiblyUsedConstraint[] = [];

        // for a constraint with a "to", create another constraint with the opposite direction
        // because the direction does not matter in the input but it matters when computing

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
        */

        // maintain function purity by creating an array of mocks with some extra properties

        const mocks: DrawableMock[] = [];

        for (const obj of objs) {
            // find constraints for this obj
            const constraintsWithObject = constraints.filter((constraint) => constraint.constraint.from.object === obj);

            mocks.push({
                x: false,
                y: false,
                constraints: constraintsWithObject,
            });
        }

        // actually order the constraints

        const constsInOrder: Constraint[] = [];

        for (const _unused of mocks) {
            for (const mock of mocks) {
                // compute x coord

                // check all the dependencies
                let allClear = true;
                for (const cons of mock.constraints) {
                    if (!cons.constraint.to) continue;

                    const xCoordTypes = getXCoordTypes();
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

                if (allClear && !mock.x) {
                    //TODO:
                    // check if we can compute this
                    // or it is conflicting or ambiguous ( + need ordering)

                    mock.x = true;
                    for (const cons of mock.constraints) {
                        // copy the constraints
                        const xCoordTypes = getXCoordTypes();
                        if (!xCoordTypes.includes(cons.constraint.from.propertyType)) continue;

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

                    const yCoordTypes = getYCoordTypes();
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

                if (allClear && !mock.y) {
                    //TODO:
                    // check if we can compute this
                    // or it is conflicting or ambiguous ( + need ordering)

                    mock.y = true;
                    for (const cons of mock.constraints) {
                        const yCoordTypes = getYCoordTypes();
                        if (!yCoordTypes.includes(cons.constraint.from.propertyType)) continue;
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

    compute() {
        for (const constraint of this.constraints) {
            const obj = constraint.from.object;
            let value: number;
            if (!constraint.to) {
                // TODO: check unit
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                value = constraint.amount!.value;
            } else {
                const to = constraint.to;
                switch (to.propertyType) {
                    case PropertyType.WIDTH:
                        value = to.object.width;
                        break;
                    case PropertyType.HEIGHT:
                        value = to.object.height;
                        break;
                    case PropertyType.LEFT:
                        value = to.object.x;
                        break;
                    case PropertyType.RIGHT:
                        value = to.object.x + to.object.width;
                        break;
                    case PropertyType.TOP:
                        value = to.object.y;
                        break;
                    case PropertyType.BOTTOM:
                        value = to.object.y + to.object.height;
                        break;
                }
                if (constraint.amount) value += constraint.amount.value;
            }
            if (constraint.from.propertyType === PropertyType.WIDTH) {
                if (constraint.type === ConstraintType.EQUAL) {
                    obj.width = value;
                } else if (constraint.type === ConstraintType.LTE) {
                    obj.width = Math.min(obj.width, value);
                } else if (constraint.type === ConstraintType.GTE) {
                    obj.width = Math.max(obj.width, value);
                }
            } else if (constraint.from.propertyType === PropertyType.HEIGHT) {
                if (constraint.type === ConstraintType.EQUAL) {
                    obj.height = value;
                } else if (constraint.type === ConstraintType.LTE) {
                    obj.height = Math.min(obj.height, value);
                } else if (constraint.type === ConstraintType.GTE) {
                    obj.height = Math.max(obj.height, value);
                }
            } else if (constraint.from.propertyType === PropertyType.LEFT) {
                if (constraint.type === ConstraintType.EQUAL) {
                    obj.x = value;
                } else if (constraint.type === ConstraintType.LTE) {
                    obj.x = Math.min(obj.x, value);
                } else if (constraint.type === ConstraintType.GTE) {
                    obj.x = Math.max(obj.x, value);
                }
            } else if (constraint.from.propertyType === PropertyType.RIGHT) {
                if (constraint.type === ConstraintType.EQUAL) {
                    obj.width = value - obj.x;
                } else if (constraint.type === ConstraintType.LTE) {
                    obj.width = Math.min(obj.width + obj.x, value) - obj.x;
                } else if (constraint.type === ConstraintType.GTE) {
                    obj.width = Math.max(obj.width + obj.x, value) - obj.x;
                }
            } else if (constraint.from.propertyType === PropertyType.TOP) {
                if (constraint.type === ConstraintType.EQUAL) {
                    obj.y = value;
                } else if (constraint.type === ConstraintType.LTE) {
                    obj.y = Math.min(obj.y, value);
                } else if (constraint.type === ConstraintType.GTE) {
                    obj.y = Math.max(obj.y, value);
                }
            } else if (constraint.from.propertyType === PropertyType.BOTTOM) {
                if (constraint.type === ConstraintType.EQUAL) {
                    obj.height = value - obj.y;
                } else if (constraint.type === ConstraintType.LTE) {
                    obj.height = Math.min(obj.height + obj.y, value) - obj.x;
                } else if (constraint.type === ConstraintType.GTE) {
                    obj.height = Math.max(obj.height + obj.y, value) - obj.x;
                }
            }
        }
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

function getXCoordTypes() {
    return [PropertyType.LEFT, PropertyType.RIGHT, PropertyType.WIDTH];
}

function getYCoordTypes() {
    return [PropertyType.TOP, PropertyType.BOTTOM, PropertyType.HEIGHT];
}
