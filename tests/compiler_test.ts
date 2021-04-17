import { assertEquals } from "https://deno.land/std@0.92.0/testing/asserts.ts";
import { NestedCallExp, NotNestedCallExp } from "./testdata/tokens.ts";
import {
  NestedCallExpAst,
  NestedStringLiteralAst,
  NewNestedAst,
  NewNotNestedAst,
  NotNestedCallExpAst,
  NotNestedStringLiteralAst,
} from "./testdata/ast.ts";
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
  assertEquals(NestedCallExp, tokens);
});

Deno.test("Tokenize not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  assertEquals(NotNestedCallExp, tokens);
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
  assertEquals(NestedCallExpAst, ast);
});

Deno.test("parse not nested CallExpression", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  const ast = parse(tokens);

  assertEquals(NotNestedCallExpAst, ast);
});

Deno.test("Transform ast for nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  assertEquals(NewNestedAst, newAst);
});

Deno.test("Transform ast for not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  assertEquals(NewNotNestedAst, newAst);
});

Deno.test("Transform ast for StringLiterals", () => {
  const input = `(foo "foo") (baz "baz")`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  assertEquals(NotNestedStringLiteralAst, newAst);
});

Deno.test("Transform ast for nested StringLiterals", () => {
  const input = `(foo "foo" (bar "bar"))`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  assertEquals(NestedStringLiteralAst, newAst);
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
  assertEquals(nestedTokens, NestedCallExp);
  const notNestedTokens = tokenize(notNestedInput);
  assertEquals(notNestedTokens, NotNestedCallExp);
  const nestedAst = parse(nestedTokens);
  assertEquals(nestedAst, NestedCallExpAst);
  const notNestedAst = parse(notNestedTokens);
  assertEquals(notNestedAst, NotNestedCallExpAst);
  const newNestedAst = transform(nestedAst);
  assertEquals(newNestedAst, NewNestedAst);
  const newNotNestedAst = transform(notNestedAst);
  assertEquals(newNotNestedAst, NewNotNestedAst);
});
