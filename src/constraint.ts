import { ConstraintTarget } from "./constraint-target";

export interface Constraint {
    from: ConstraintTarget;
    to?: ConstraintTarget;
    type: ConstraintType;
    operators?: [
        {
            value: number;
            unit: Unit;
            operator: Operator;
        }
    ];
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

export enum Operator {
    ADD = "add",
}
