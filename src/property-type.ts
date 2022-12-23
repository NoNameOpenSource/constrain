import { ObjectValues } from "./lib/ts-helpers";

export const PROPERTY_TYPE = {
    TOP: "top",
    RIGHT: "right",
    BOTTOM: "bottom",
    LEFT: "left",
    WIDTH: "width",
    HEIGHT: "height",
} as const;
export type PropertyType = ObjectValues<typeof PROPERTY_TYPE>;
