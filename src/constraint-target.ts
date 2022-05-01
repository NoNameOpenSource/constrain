import { DrawableObject } from "./drawable-object";
import { PropertyType } from "./property-type";

export interface ConstraintTarget {
    object: DrawableObject;
    propertyType: PropertyType;
}
