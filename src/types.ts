export type Position = {
  line: number;
  column: number;
};

export type TokenKind =
  // Separators
  'Indent' |
  'Dedent' |
  'NewLine' |
  'LeftParen' |
  'RightParen' |
  'LeftBracket' |
  'RightBracket' |
  'LeftBrace' |
  'RightBrace' |
  'Dot' |
  'ConditionalDot' |
  'Comma' |
  'Colon' |
  'Semicolon' |
  'Arrow' |
  'FatArrow' |
  'Spread' |

  // Literals
  'Id' |
  'Int' |
  'Float' |
  'Str' |

  // Reserved keywords
  'KeywordAs' |
  'KeywordBreak' |
  'KeywordContinue' |
  'KeywordElse' |
  'KeywordExport' |
  'KeywordFalse' |
  'KeywordFrom' |
  'KeywordIf' |
  'KeywordImport' |
  'KeywordNull' |
  'KeywordPass' |
  'KeywordReturn' |
  'KeywordTrue' |
  'KeywordType' |
  'KeywordWhile' |

  // Operators
  'Assign' |
  'Add' |
  'Sub' |
  'Mul' |
  'Div' |
  'Mod' |
  'And' |
  'Or' |
  'Not' |
  'BitwiseNot' |
  'Eq' |
  'Ne' |
  'Lt' |
  'Gt' |
  'Lte' |
  'Gte' |
  'BitwiseXor' |
  'LeftShift' |
  'RightShift' |
  'LogicalAnd' |
  'LogicalOr';

export type Token = {
  position: Position;
  kind: TokenKind;
};

export type IdentifierToken = Token & {
  kind: 'Id';
  id: string;
};

export type NumberLiteralToken = Token & {
  kind: 'Float' | 'Int';
  value: string;
};

export type StringLiteralToken = Token & {
  kind: 'Str';
  value: string;
};
