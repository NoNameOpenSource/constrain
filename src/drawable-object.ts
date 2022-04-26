import { Constraint } from "./constraint";
import { LayoutDefinition } from "./layout-definition";

export interface DrawableObject extends LayoutDefinition {
    update: (rect: LayoutDefinition) => void;
}

export interface Parent {
    children: DrawableObject[];
    constraints: Constraint[];
    atLeastOneChildWillBeUpdated: () => boolean;
}
