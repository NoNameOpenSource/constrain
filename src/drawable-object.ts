import { LayoutDefinition } from "./layout-definition";
import { ConstraintGroup } from "./layout-engine";

export interface DrawableObject extends LayoutDefinition {
    update: (rect: LayoutDefinition) => Promise<void> | void;
    children: DrawableObject[];
    constraintGroup: ConstraintGroup;
    atLeastOneChildWillBeUpdated: () => boolean;
}
