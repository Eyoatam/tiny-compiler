export const NestedCallExp = [
  { type: "paren", value: "(" },
  { type: "name", value: "add" },
  { type: "number", value: "1" },
  { type: "paren", value: "(" },
  { type: "name", value: "subtract" },
  { type: "number", value: "6" },
  { type: "number", value: "5" },
  { type: "paren", value: ")" },
  { type: "paren", value: ")" },
];

export const NotNestedCallExp = [
  { type: "paren", value: "(" },
  { type: "name", value: "add" },
  { type: "number", value: "1" },
  { type: "paren", value: ")" },
  { type: "paren", value: "(" },
  { type: "name", value: "subtract" },
  { type: "number", value: "6" },
  { type: "number", value: "5" },
  { type: "paren", value: ")" },
];

export const NumberLiteral = [
  { type: "number", value: "1" },
  {
    type: "number",
    value: "2",
  },
];

export const StringLiteral = [
  { type: "string", value: "some" },
  {
    type: "string",
    value: "string",
  },
];
