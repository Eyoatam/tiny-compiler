import { assertEquals } from "https://deno.land/std@0.92.0/testing/asserts.ts";
import {
  compile,
  generate,
  parse,
  tokenize,
  transform,
} from "../src/compiler.ts";

Deno.test("Tokenize nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  assertEquals(tokens, [
    { type: "paren", value: "(" },
    { type: "name", value: "add" },
    { type: "number", value: "1" },
    { type: "paren", value: "(" },
    { type: "name", value: "subtract" },
    { type: "number", value: "6" },
    { type: "number", value: "5" },
    { type: "paren", value: ")" },
    { type: "paren", value: ")" },
  ]);
});

Deno.test("Tokenize not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  assertEquals(tokens, [
    { type: "paren", value: "(" },
    { type: "name", value: "add" },
    { type: "number", value: "1" },
    { type: "paren", value: ")" },
    { type: "paren", value: "(" },
    { type: "name", value: "subtract" },
    { type: "number", value: "6" },
    { type: "number", value: "5" },
    { type: "paren", value: ")" },
  ]);
});

Deno.test("Tokenize number literals", () => {
  const input = "1 2";
  const tokens = tokenize(input);
  assertEquals(tokens, [
    { type: "number", value: "1" },
    {
      type: "number",
      value: "2",
    },
  ]);
});

Deno.test("Tokenize string literals", () => {
  const input = `"some" "string"`;
  const tokens = tokenize(input);
  assertEquals(tokens, [
    { type: "string", value: "some" },
    {
      type: "string",
      value: "string",
    },
  ]);
});

Deno.test("parse string literals", () => {
  const input = `"some" "string"`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  assertEquals(ast, {
    type: "Program",
    body: [
      { type: "StringLiteral", value: "some" },
      { type: "StringLiteral", value: "string" },
    ],
  });
});

Deno.test("parse number literals", () => {
  const input = "1 2";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  assertEquals(ast, {
    type: "Program",
    body: [
      { type: "NumberLiteral", value: "1" },
      {
        type: "NumberLiteral",
        value: "2",
      },
    ],
  });
});

Deno.test("parse nested CallExpression", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const ast2 = {
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

  assertEquals(ast, ast2);
});

Deno.test("parse not nested CallExpression", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const ast2 = {
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

  assertEquals(ast, ast2);
});

Deno.test("Transform ast for nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const ast2 = {
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
  const newAst = transform(ast);
  assertEquals(ast2, newAst);
});

Deno.test("Transform ast for not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const ast2 = {
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
  const newAst = transform(ast);
  assertEquals(ast2, newAst);
});

Deno.test("Transform ast for StringLiterals", () => {
  const input = `(foo "foo") (baz "baz")`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const ast2 = {
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
  const newAst = transform(ast);
  assertEquals(newAst, ast2);
});

Deno.test("Transform ast for nested StringLiterals", () => {
  const input = `(foo "foo" (bar "bar"))`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const ast2 = {
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
  const newAst = transform(ast);
  assertEquals(ast2, newAst);
});

Deno.test("generate code for nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  const code = generate(newAst);
  const output = "add(1, subtract(6, 5));";
  assertEquals(code, output);
});

Deno.test("generate code for not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  const output = generate(newAst);
  const code = "add(1);\nsubtract(6, 5);";
  assertEquals(code, output);
});

Deno.test("compiler for code with nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const output = compile(input);
  const code = "add(1, subtract(6, 5));";
  assertEquals(code, output);
});

Deno.test("compiler for code with not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)`;
  const output = compile(input);
  const code = "add(1);\nsubtract(6, 5);";
  assertEquals(code, output);
});

Deno.test("all", () => {
  const notNestedInput = `(add 1)
  (subtract 6 5)`;
  const nestedInput = "(add 1 (subtract 6 5))";
  const nestedTokens = tokenize(nestedInput);
  assertEquals(nestedTokens, [
    { type: "paren", value: "(" },
    { type: "name", value: "add" },
    { type: "number", value: "1" },
    { type: "paren", value: "(" },
    { type: "name", value: "subtract" },
    { type: "number", value: "6" },
    { type: "number", value: "5" },
    { type: "paren", value: ")" },
    { type: "paren", value: ")" },
  ]);
  const notNestedTokens = tokenize(notNestedInput);
  assertEquals(notNestedTokens, [
    { type: "paren", value: "(" },
    { type: "name", value: "add" },
    { type: "number", value: "1" },
    { type: "paren", value: ")" },
    { type: "paren", value: "(" },
    { type: "name", value: "subtract" },
    { type: "number", value: "6" },
    { type: "number", value: "5" },
    { type: "paren", value: ")" },
  ]);
  const nestedAst = parse(nestedTokens);
  assertEquals(nestedAst, {
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
  });
  const notNestedAst = parse(notNestedTokens);
  assertEquals(notNestedAst, {
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
  });
  const newNestedAst = transform(nestedAst);
  assertEquals(newNestedAst, {
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
  });
  const newNotNestedAst = transform(notNestedAst);
  assertEquals(newNotNestedAst, {
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
  });
});
