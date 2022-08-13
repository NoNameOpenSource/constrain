import { z } from 'zod';

export const Child = z.object({
    name: z.string(),
    children: Child[],
    constraints: Constraint[]
});

const data = readFile('data.json');

const result = Child.parse(data);

