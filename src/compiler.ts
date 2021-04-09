export interface Token {
  type: string;
  value: string;
}

export function tokenize(input: string): Token[] {
  let current = 0;
  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "(") {
      tokens.push({
        type: "paren",
        value: "(",
      });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({
        type: "paren",
        value: ")",
      });
      current++;
      continue;
    }

    const WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = "";
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "number",
        value,
      });
      continue;
    }

    if (char === '"') {
      let value = "";
      char = input[++current];

      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      char = input[++current];
      tokens.push({ type: "string", value });
      continue;
    }

    const LETTER = /[a-z]/i;
    if (LETTER.test(char)) {
      let value = "";

      while (LETTER.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: "name", value });
      continue;
    }

    throw new TypeError("Unknown type" + char);
  }
  return tokens;
}

export function parse(tokens: Token[]) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === "number") {
      current++;

      return {
        type: "NumberLiteral",
        value: token.value,
      };
    }

    if (token.type === "string") {
      current++;

      return {
        type: "StringLiteral",
        value: token.value,
      };
    }

    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current];
      const node: {
        type: string;
        name: string;
        params: Record<string, unknown>[];
      } = {
        type: "CallExpression",
        name: token.value,
        params: [],
      };

      token = tokens[++current];

      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;
      return node;
    }
    throw new TypeError("Unknown type" + token.type);
  }

  // deno-lint-ignore no-explicit-any
  const ast: { type: string; body: any[] } = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

// const parsedTokens = parse(
//   tokenize(`(add 2 (subtract 4 2))
// (add 2 2)
// (subtract 4 2)
// `)
// );
// const stringified = JSON.stringify(parsedTokens);
// const encoder = new TextEncoder();
// await Deno.writeFile("./ast.json", encoder.encode(stringified));
