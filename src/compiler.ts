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
  callee?: { type: string; name: string };
  arguments?: string[];
}

export interface Visitor {
  [index: string]: {
    enter: EnterFn;
    exit?: ExitFn;
  };
  NumberLiteral: {
    enter: EnterFn;
  };
  StringLiteral: {
    enter: EnterFn;
  };
  CallExpression: {
    enter: EnterFn;
  };
}

export interface Ast {
  type: string;
  body: unkObj[];
  params?: unkObj[];
  // deno-lint-ignore no-explicit-any
  _context?: any;
}

export interface unkObj {
  [x: string]: unknown;
}

export type EnterFn = (
  node: {
    value?: string;
    _context?: Context[];
    name?: string;
    body?: unkObj[];
  },
  parent: { type: string; _context: { type: string; value: string }[] },
) => void;

export type ExitFn = EnterFn;

export type Expression = {
  type: string;
  callee?: { type: string; name: string };
  // deno-lint-ignore no-explicit-any
  arguments?: string[] | any[];
  expression: unkObj;
};

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

export function parse(tokens: Token[]): Ast {
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

  const ast: Ast = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

export function traverse(ast: Ast, visitor: Visitor) {
  function traverseArray(array: unkObj[], parent: Ast) {
    // deno-lint-ignore no-explicit-any
    array.forEach((child: any) => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(
    node: Ast,
    // deno-lint-ignore no-explicit-any
    parent: { type: string; _context: { type: string; value: string }[] } | any,
  ) {
    const methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }
    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "CallExpression":
        traverseArray(node.params ? node.params : [], node);
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
export function transform(ast: Ast): Ast {
  const newAst: { type: string; body: unkObj[] } = {
    type: "Program",
    body: [],
  };

  ast._context = newAst.body;

  traverse(ast, {
    NumberLiteral: {
      enter(
        node: { value?: string },
        parent: { _context: { type: string; value: string }[] },
      ) {
        parent._context.push({
          type: "NumberLiteral",
          value: node.value ? node.value : "",
        });
      },
    },

    StringLiteral: {
      enter(node: { value?: string }, parent: { _context: Context[] }) {
        parent._context.push({
          type: "StringLiteral",
          value: node.value,
        });
      },
    },

    CallExpression: {
      enter(
        node: { name?: string; _context?: Context[] },
        parent: {
          type: string;
          _context: Context[];
        },
      ) {
        let expression: Expression = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: node.name ? node.name : "",
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
  // deno-lint-ignore no-explicit-any
  body: any[];
  // deno-lint-ignore no-explicit-any
  expression?: any;
  // deno-lint-ignore no-explicit-any
  callee?: any;
  // deno-lint-ignore no-explicit-any
  arguments?: any[];
  type?: string;
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
