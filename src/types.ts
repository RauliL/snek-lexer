export type Position = {
  line: number;
  column: number;
};

export type SeparatorTokenKind =
  | 'Indent'
  | 'Dedent'
  | 'NewLine'
  | '('
  | ')'
  | '['
  | ']'
  | '{'
  | '}'
  | '.'
  | '?.'
  | ','
  | ':'
  | ';'
  | '->'
  | '=>'
  | '...';

export type LiteralTokenKind = 'Id' | 'Int' | 'Float' | 'Str';

export type KeywordTokenKind =
  | 'KeywordAs'
  | 'KeywordBreak'
  | 'KeywordContinue'
  | 'KeywordElse'
  | 'KeywordExport'
  | 'KeywordFalse'
  | 'KeywordFrom'
  | 'KeywordIf'
  | 'KeywordImport'
  | 'KeywordNull'
  | 'KeywordPass'
  | 'KeywordReturn'
  | 'KeywordTrue'
  | 'KeywordType'
  | 'KeywordWhile';

export type OperatorTokenKind =
  | '='
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '&'
  | '|'
  | '!'
  | '~'
  | '=='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | '^'
  | '<<'
  | '>>'
  | '&&'
  | '||';

export type TokenKind = SeparatorTokenKind | LiteralTokenKind | KeywordTokenKind | OperatorTokenKind;

export type Token = {
  position: Position;
  kind: TokenKind;
};

export type SeparatorToken = Token & { kind: SeparatorTokenKind };

export type LiteralToken = Token & { kind: LiteralTokenKind };

export type IdentifierToken = LiteralToken & {
  kind: 'Id';
  id: string;
};

export type NumberLiteralToken = LiteralToken & {
  kind: 'Float' | 'Int';
  value: string;
};

export type FloatLiteralToken = NumberLiteralToken & { kind: 'Float' };
export type IntLiteralToken = NumberLiteralToken & { kind: 'Int' };

export type StringLiteralToken = Token & {
  kind: 'Str';
  value: string;
};

export type KeywordTokem = Token & { kind: KeywordTokenKind };

export type OperatorToken = Token & { kind: OperatorTokenKind };
