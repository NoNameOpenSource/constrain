import { ConstraintTarget } from "./constraint-target";

export interface Constraint {
    from: ConstraintTarget;
    to?: ConstraintTarget;
    type: ConstraintType;
    amount?: {
        value: number;
        unit: Unit;
    };
}

export enum ConstraintType {
    /** Equal to */
    EQUAL = "equal",
    /** Greater than or equal to */
    GTE = "gte",
    /** Less than or equal to */
    LTE = "lte",
}

export enum Unit {
    PIXEL = "px",
    PERCENT = "%",
    EM = "em",
    REM = "rem",
}
