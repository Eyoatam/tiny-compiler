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
  callee?: {
    type: string;
    name: string;
  };
  arguments?: Array<Context>;
}

export interface Visitor {
  [x: string]: {
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
  body: Array<unkObj>;
  params?: Array<unkObj>;
  _context?: Array<{
    type: string;
    value: string;
  }>;
}

export interface AstNode {
  type: string;
  body: Array<unkObj>;
  _context?: Array<{
    type: string;
    value: string;
  }>;
  name?: string;
  value?: string;
  params?: Array<unkObj>;
}

export interface ParentNode {
  type: string;
  _context?: Array<{
    type: string;
    value: string;
  }>;
}

export interface unkObj {
  [x: string]: unknown;
}

// TODO: remove any types
export interface GeneratorNode {
  // deno-lint-ignore no-explicit-any
  body: Array<any>;
  // deno-lint-ignore no-explicit-any
  expression?: any;
  // deno-lint-ignore no-explicit-any
  callee?: any;
  // deno-lint-ignore no-explicit-any
  arguments?: Array<any>;
  type?: string;
  name?: string;
  value?: string;
}

export type EnterFn = (node: AstNode, parent?: ParentNode) => void;
export type ExitFn = EnterFn;

export type Expression = {
  type: string;
  callee?: Callee;
  arguments?: Array<Context>;
  expression: unkObj;
};

export function tokenize(input: string): Array<Token> {
  let current = 0;
  const tokens: Array<Token> = [];

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

export function parse(tokens: Array<Token>): Ast {
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
        params: Array<unkObj>;
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
  function traverseArray(array: Array<unkObj>, parent: ParentNode) {
    // deno-lint-ignore no-explicit-any
    array.forEach((child: any) => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node: AstNode, parent?: ParentNode) {
    const methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }
    switch (node.type) {
      case "Program": {
        traverseArray(node.body, node);
        break;
      }

      case "CallExpression": {
        traverseArray(node.params ? node.params : [], node);
        break;
      }

      case "NumberLiteral":
        break;

      case "StringLiteral":
        break;

      default:
        throw new TypeError(node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node);
    }
  }
  traverseNode(ast);
}

export function transform(ast: Ast): Ast {
  const newAst: {
    type: string;
    body: Array<{
      type: string;
      value: string;
    }>;
    params?: Array<unkObj>;
    _context?: Array<{
      type: string;
      value: string;
    }>;
  } = {
    type: "Program",
    body: [],
  };

  ast._context = newAst.body;

  traverse(ast, {
    NumberLiteral: {
      enter(
        node: {
          value?: string;
        },
        parent?: {
          _context?: Array<{
            type: string;
            value: string;
          }>;
        },
      ) {
        parent?._context?.push?.({
          type: "NumberLiteral",
          value: node.value ? node.value : "",
        });
      },
    },

    StringLiteral: {
      enter(
        node: {
          value?: string;
        },
        parent?: {
          _context?: Array<Context>;
        },
      ) {
        parent?._context?.push?.({
          type: "StringLiteral",
          value: node.value,
        });
      },
    },

    CallExpression: {
      enter(
        node: {
          name?: string;
          _context?: Array<Context>;
        },
        parent?: {
          type: string;
          _context?: Array<Context>;
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
        if (parent?.type !== "CallExpression") {
          expression = {
            type: "ExpressionStatement",
            expression,
          };
        }
        parent?._context?.push?.(expression);
      },
    },
  });
  return newAst;
}

export function generate<T extends GeneratorNode>(node: T): string {
  switch (node.type ? node.type : "") {
    case "Program":
      return node.body.map(generate).join("\n");

    case "ExpressionStatement":
      return `${generate(node.expression)};`;

    case "CallExpression":
      return `${generate(node.callee)}(${node.arguments
        ?.map?.(generate)
        .join?.(", ")})`;

    case "Identifier":
      return node.name ? node.name : "";

    case "NumberLiteral":
      return node.value ? node.value : "";

    case "StringLiteral":
      return `"${node.value}"`;

    default:
      throw new TypeError(`Unknown type ${node.type}`);
  }
}

export function compile(input: string): string {
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const newAst = transform(ast);
  const output = generate(newAst);
  return output;
}
