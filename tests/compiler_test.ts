import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.92.0/testing/asserts.ts";
import {
  compile,
  generate,
  parse,
  tokenize,
  transform,
} from "../src/compiler.ts";
import {
  NestedCallExp,
  NotNestedCallExp,
  NumberLiteral,
  StringLiteral,
} from "./testdata/tokens.ts";
import {
  NestedCallExpAst,
  NestedStringLiteralAst,
  NewNestedAst,
  NewNotNestedAst,
  NotNestedCallExpAst,
  NotNestedStringLiteralAst,
  NumberLiteralAst,
  StringLiteralAst,
} from "./testdata/ast.ts";

Deno.test("it should Tokenize nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  assertEquals(NestedCallExp, tokens);
});

Deno.test("it should Tokenize not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  assertEquals(NotNestedCallExp, tokens);
});

Deno.test("it should Tokenize number literals", () => {
  const input = "1 2";
  const tokens = tokenize(input);
  assertEquals(tokens, NumberLiteral);
});

Deno.test("it should Tokenize string literals", () => {
  const input = `"some" "string"`;
  const tokens = tokenize(input);
  assertEquals(tokens, StringLiteral);
});

Deno.test("it should throw a TypeError", () => {
  assertThrows(
    () => {
      const input = `(add 1)
  (subtract 6 5);
  `;
      tokenize(input);
    },
    TypeError,
    "Unknown type ;",
  );
});

Deno.test("it should parse string literals", () => {
  const input = `"some" "string"`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  assertEquals(ast, StringLiteralAst);
});

Deno.test("it should parse number literals", () => {
  const input = "1 2";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  assertEquals(ast, NumberLiteralAst);
});

Deno.test("it should parse nested CallExpression", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  assertEquals(NestedCallExpAst, ast);
});

Deno.test("it should parse not nested CallExpression", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  const ast = parse(tokens);

  assertEquals(NotNestedCallExpAst, ast);
});

Deno.test("it should throw a TypeError When parsing", () => {
  assertThrows(
    () => {
      const input = `(add 1)
      (subtract 6 5);
      `;
      const tokens = tokenize(input);
      parse(tokens);
    },
    TypeError,
    "Unknown type ;",
  );
});

Deno.test("it should Transform ast for nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  assertEquals(NewNestedAst, newAst);
});

Deno.test("it should Transform ast for not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)
  `;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  assertEquals(NewNotNestedAst, newAst);
});

Deno.test("it should Transform ast for StringLiterals", () => {
  const input = `(foo "foo") (baz "baz")`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  assertEquals(NotNestedStringLiteralAst, newAst);
});

Deno.test("it should Transform ast for nested StringLiterals", () => {
  const input = `(foo "foo" (bar "bar"))`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  assertEquals(NestedStringLiteralAst, newAst);
});

Deno.test("it should generate code for nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  const code = generate(newAst);
  const output = "add(1, subtract(6, 5));";
  assertEquals(code, output);
});

Deno.test("it should generate code for not nested CallExpressions", () => {
  const input = `(add 1)
  (subtract 6 5)`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  const output = generate(newAst);
  const code = "add(1);\nsubtract(6, 5);";
  assertEquals(code, output);
});

Deno.test("it should generate code with number literals", () => {
  const input = "1 2";
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  const generatedCode = generate(newAst);
  assertEquals(generatedCode, "1\n2");
});

Deno.test("it should generate code with string literals", () => {
  const input = `"some" "string"`;
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  const generatedCode = generate(newAst);
  assertEquals(
    generatedCode,
    `"some"
"string"`,
  );
});

Deno.test("it should throw a TypeError When generating", () => {
  assertThrows(
    () => {
      const input = `"some", "string"`;
      const tokens = tokenize(input);
      const ast = parse(tokens);
      const newAst = transform(ast);
      generate(newAst);
    },
    TypeError,
    "Unknown type ,",
  );
});

Deno.test("it should compile code with nested CallExpressions", () => {
  const input = "(add 1 (subtract 6 5))";
  const output = compile(input);
  const code = "add(1, subtract(6, 5));";
  assertEquals(code, output);
});

Deno.test("it should code with not nested CallExpressions", () => {
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
