import { ConstraintTarget } from "./constraint-target";
import { ObjectValues } from "./lib/ts-helpers";

export const CONSTRAINT_TYPE = {
    /** Equal to */
    EQUAL: "equal",
    /** Greater than or equal to */
    GTE: "gte",
    /** Less than or equal to */
    LTE: "lte",
} as const;
export type ConstraintType = ObjectValues<typeof CONSTRAINT_TYPE>;

export const UNIT = {
    PIXEL: "px",
    PERCENT: "%",
    EM: "em",
    REM: "rem",
} as const;
export type Unit = ObjectValues<typeof UNIT>;

export const OPERATOR = {
    ADD: "add",
} as const;
export type Operator = ObjectValues<typeof OPERATOR>;

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
