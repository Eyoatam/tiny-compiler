// deno-lint-ignore-file

export interface Token {
  type: string;
  value: string;
}

export interface Callee {
  type: string;
  name: string;
}

export interface Context {
  type: string;
  value?: string;
  callee?: { type: string; name: any };
  arguments?: any[];
}

export interface Visitor {
  [index: string]: {
    enter(node: any, parent: any): void;
    exit?(node: any, parent: any): void;
  };
  NumberLiteral: { enter(node: any, parent: any): void };
  StringLiteral: { enter(node: any, parent: any): void };
  CallExpression: { enter(node: any, parent: any): void };
}

export type Expression = {
  type: string;
  callee?: { type: string; name: string };
  arguments?: string[] | any[];
  expression: unkObj;
};

export type unkObj = Record<string, unknown>;

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

    throw new TypeError(`Unknown type ${char}`);
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
        params: unkObj[];
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
    throw new TypeError(`Unknown type ${token.type}`);
  }

  const ast: { type: string; body: unkObj[] } = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

export function traverse(ast: any, visitor: Visitor) {
  function traverseArray(array: any[], parent: any) {
    array.forEach((child: any) => {
      traverseNode(child, parent);
    });
  }
  function traverseNode(
    node: { type: string; body: any[]; params: any[] },
    parent: any
  ) {
    let methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }
    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "CallExpression":
        traverseArray(node.params, node);
        break;

      case "NumberLiteral":
        break;
      case "StringLiteral":
        break;

      default:
        throw new TypeError(node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }
  traverseNode(ast, null);
}
export function transform(ast: {
  type?: string;
  body?: unkObj[];
  _context?: any;
}) {
  const newAst: { type: string; body: unkObj[] } = {
    type: "Program",
    body: [],
  };

  ast._context = newAst.body;

  traverse(ast, {
    NumberLiteral: {
      enter(
        node: { value: any },
        parent: { _context: { type: string; value: any }[] }
      ) {
        parent._context.push({
          type: "NumberLiteral",
          value: node.value,
        });
      },
    },

    StringLiteral: {
      enter(node: { value: any }, parent: { _context: Context[] }) {
        parent._context.push({
          type: "StringLiteral",
          value: node.value,
        });
      },
    },

    CallExpression: {
      enter(
        node: { name: string; _context: Context[] },
        parent: {
          type: string;
          _context: Context[];
        }
      ) {
        let expression: Expression = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: node.name,
          },
          arguments: [],
          expression: {},
        };
        node._context = expression.arguments ? expression.arguments : [];
        if (parent.type !== "CallExpression") {
          expression = {
            type: "ExpressionStatement",
            expression,
          };
        }
        parent._context.push(expression);
      },
    },
  });
  return newAst;
}

export function generate(node: {
  type?: string;
  body: any[];
  expression?: any;
  callee?: any;
  arguments?: any[];
  name?: string;
  value?: string;
}): string {
  switch (node.type) {
    case "Program":
      return node.body.map(generate).join("\n");
    case "ExpressionStatement":
      return generate(node.expression) + ";";
    case "CallExpression":
      return (
        generate(node.callee) +
        "(" +
        node.arguments?.map(generate).join(", ") +
        ")"
      );
    case "Identifier":
      return node.name ? node.name : "";
    case "NumberLiteral":
      return node.value ? node.value : "";
    case "StringLiteral":
      return '"' + node.value + '"';
    default:
      throw new TypeError(`unknown type ${node.type}`);
  }
}

export function compile(input: string): string {
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  const output = generate(newAst);
  return output;
}
