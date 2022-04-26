import { Parent } from "./drawable-object";
import { PropertyType } from "./property-type";

export interface ConstraintTarget {
    object: Parent;
    propertyType: PropertyType;
}
