import { Constraint } from "./constraint";
import { DrawableObject, Parent } from "./drawable-object";

export function compute(obj: Parent) {
    if (obj.children.length < 1) {
        return;
    }

    interface Child extends DrawableObject {
        requiresUpdate: boolean;
    }

    const children: Child[] = [];

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

    for (const child of children) {
        if (child.requiresUpdate) {
            child.update({
                x: child.x,
                y: child.y,
                width: child.width,
                height: child.height,
            });
        }
    }
}

/**
 * @todo should this be exported?
 */
export function computeOrder(set: ConstraintGroup) {
    const constraints: Constraint[] = [...set.constraints];
    // TODO: order the `constraints` array

    const newSet: ConstraintGroup = {
        constraints,
        dirty: false,
    };
    return newSet;
}

export interface ConstraintGroup {
    constraints: Constraint[];
    dirty: boolean;
}
