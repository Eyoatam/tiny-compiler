import { assertEquals } from "https://deno.land/std@0.92.0/testing/asserts.ts";
import {
  compile,
  generate,
  parse,
  tokenize,
  transform,
} from "../src/compiler.ts";

const { readFile } = Deno;

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

Deno.test("parse nested CallExpression", async () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = JSON.stringify(parse(tokens));
  const decoder = new TextDecoder("utf-8");
  const file = await readFile("./testdata/ast1.json");
  const ast1 = decoder.decode(file);
  assertEquals(ast, ast1);
});

Deno.test("parse not nested CallExpression", async () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  const ast = JSON.stringify(parse(tokens));
  const decoder = new TextDecoder("utf-8");
  const file = await readFile("./testdata/ast2.json");
  const ast1 = decoder.decode(file);
  assertEquals(ast, ast1);
});

Deno.test("Transform ast for nested CallExpressions", async () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = JSON.stringify(transform(ast));
  const decoder = new TextDecoder("utf-8");
  const file = await readFile("./testdata/ast3.json");
  const ast1 = decoder.decode(file);
  assertEquals(ast1, newAst);
});

Deno.test("Transform ast for not nested CallExpressions", async () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = JSON.stringify(transform(ast));
  const decoder = new TextDecoder("utf-8");
  const file = await readFile("./testdata/ast4.json");
  const ast1 = decoder.decode(file);
  assertEquals(ast1, newAst);
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

Deno.test("compiler for code with not nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const output = compile(input);
  const code = "add(1, subtract(6, 5));";
  assertEquals(code, output);
});

Deno.test("compiler for code with nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)`;
  const output = compile(input);
  const code = "add(1);\nsubtract(6, 5);";
  assertEquals(code, output);
});
