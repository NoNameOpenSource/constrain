import * as kiwi from "@lume/kiwi";

// Create a solver
const solver = new kiwi.Solver();

// Create edit variables
const left = new kiwi.Variable();
const width = new kiwi.Variable();
solver.addEditVariable(left, kiwi.Strength.strong);
solver.addEditVariable(width, kiwi.Strength.strong);
console.log(left.value());
solver.suggestValue(left, 100);
solver.suggestValue(width, 400);

// Create and add a constraint
const right = new kiwi.Variable();
solver.addConstraint(new kiwi.Constraint(new kiwi.Expression([-1, right], left, width), kiwi.Operator.Eq));

// Solve the constraints
solver.updateVariables();

console.log(right.value());
