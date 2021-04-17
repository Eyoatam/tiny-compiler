export const NestedCallExpAst = {
  type: "Program",
  body: [
    {
      type: "CallExpression",
      name: "add",
      params: [
        { type: "NumberLiteral", value: "1" },
        {
          type: "CallExpression",
          name: "subtract",
          params: [
            { type: "NumberLiteral", value: "6" },
            { type: "NumberLiteral", value: "5" },
          ],
        },
      ],
    },
  ],
};

export const NotNestedCallExpAst = {
  type: "Program",
  body: [
    {
      type: "CallExpression",
      name: "add",
      params: [{ type: "NumberLiteral", value: "1" }],
    },
    {
      type: "CallExpression",
      name: "subtract",
      params: [
        { type: "NumberLiteral", value: "6" },
        { type: "NumberLiteral", value: "5" },
      ],
    },
  ],
};

export const NewNestedAst = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "add" },
        arguments: [
          { type: "NumberLiteral", value: "1" },
          {
            type: "CallExpression",
            callee: { type: "Identifier", name: "subtract" },
            arguments: [
              { type: "NumberLiteral", value: "6" },
              { type: "NumberLiteral", value: "5" },
            ],
            expression: {},
          },
        ],
        expression: {},
      },
    },
  ],
};

export const NewNotNestedAst = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "add" },
        arguments: [{ type: "NumberLiteral", value: "1" }],
        expression: {},
      },
    },
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "subtract" },
        arguments: [
          { type: "NumberLiteral", value: "6" },
          { type: "NumberLiteral", value: "5" },
        ],
        expression: {},
      },
    },
  ],
};

export const NestedStringLiteralAst = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "foo" },
        arguments: [
          { type: "StringLiteral", value: "foo" },
          {
            type: "CallExpression",
            callee: { type: "Identifier", name: "bar" },
            arguments: [{ type: "StringLiteral", value: "bar" }],
            expression: {},
          },
        ],
        expression: {},
      },
    },
  ],
};

export const NotNestedStringLiteralAst = {
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "foo" },
        arguments: [{ type: "StringLiteral", value: "foo" }],
        expression: {},
      },
    },
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "baz" },
        arguments: [{ type: "StringLiteral", value: "baz" }],
        expression: {},
      },
    },
  ],
};
