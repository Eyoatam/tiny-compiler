# Tiny Compiler

[![ci](https://github.com/Eyoatam/tiny-compiler/actions/workflows/ci.yml/badge.svg)](https://github.com/Eyoatam/tiny-compiler/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/eyoatam/tiny-compiler/branch/main/graph/badge.svg?token=w6s3ODtULz)](https://codecov.io/gh/eyoatam/tiny-compiler)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Eyoatam/tiny-compiler/blob/main/LICENSE)

> Based on Jamie Kyle's
> [compiler](https://github.com/jamiebuilds/the-super-tiny-compiler) This is a
> simple example of a modern compiler written in
> [typescript](https://www.typescriptlang.org/) and running on
> [deno](https://deno.land)

## Functions

### `tokenize()`

This function takes raw code and splits into things called tokens, so for the
following syntax

```
(add 6 (subtract 6 5))
```

The tokens will look like this

```js
[
  { type: "paren", value: "(" },
  { type: "name", value: "add" },
  { type: "number", value: "6" },
  { type: "paren", value: "(" },
  { type: "name", value: "subtract" },
  { type: "number", value: "6" },
  { type: "number", value: "5" },
  { type: "paren", value: ")" },
  { type: "paren", value: ")" },
];
```

### `parse()`

Now This function takes the tokens and reformats them into an Ast(Abstract
Syntax Tree) so the Ast for the above tokens would look like:

```js
{
   type: "Program",
    body: [
      {
        type: "CallExpression",
        name: "add",
        params: [
          { type: "NumberLiteral", value: "6" },
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
```

### `traverse()`

This function is used to navigate through the AST nodes. it goes through each
node in the AST.

### `transform()`

This function takes the AST and transforms it into a new AST

```js
transform({
  type: "Program",
  body: [
    {
      type: "CallExpression",
      name: "add",
      params: [
        { type: "NumberLiteral", value: "6" },
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
```

So The above function will return a transformed ast that would look like:

```js
{
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
```

### `generate()`

This function takes an AST and stringifies code back out. by calling it self
recursively.

```js
generate({
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
  };);
```

so the output for the above code will look like:

```js
add(1, subtract(6, 5));
```

### `compile()`

This function calls all of the above functions inside it and returns the
generated output.

so

```js
compile("(add 1 (subtract 6 5))");
```

would return

```js
add(1, subtract(6, 5));
```

## License

[MIT](https://github.com/Eyoatam/tiny-compiler/blob/main/LICENSE)
