// deno-lint-ignore-file

interface Token {
  type: string;
  value: string;
}
interface Callee {
  type: string;
  name: string;
}
interface Context {
  type: string;
  value?: string;
  callee?: {
    type: string;
    name: string;
  };
  arguments?: Array<Context>;
}
interface Visitor {
  [key: string]: {
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
interface Ast {
  type: string;
  body: Array<unkObj>;
  params?: Array<unkObj>;
  _context?: Array<{
    type: string;
    value: string;
  }>;
}
interface AstNode {
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
interface ParentNode {
  type: string;
  _context?: Array<{
    type: string;
    value: string;
  }>;
}
interface unkObj {
  [key: string]: unknown;
}
interface GeneratorNode {
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
declare type EnterFn = (node: AstNode, parent?: ParentNode) => void;
declare type ExitFn = EnterFn;
declare type Expression = {
  type: string;
  callee?: Callee;
  arguments?: Array<Context>;
  expression: unkObj;
};
declare function tokenize(input: string): Array<Token>;
declare function parse(tokens: Array<Token>): Ast;
declare function traverse(ast: Ast, visitor: Visitor): void;
declare function transform(ast: Ast): Ast;
declare function generate(node: GeneratorNode): string;
declare function compile(input: string): string;
