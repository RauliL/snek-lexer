import Stack from './stack';
import State from './state';
import { IdentifierToken, NumberLiteralToken, StringLiteralToken, Token, TokenKind } from './types';
import { isIdentifierPart, isIdentifierStart, isNumPart } from './utils';

const RESERVED_KEYWORDS = new Map<string, TokenKind>([
  ['as', 'KeywordAs'],
  ['break', 'KeywordBreak'],
  ['continue', 'KeywordContinue'],
  ['else', 'KeywordElse'],
  ['export', 'KeywordExport'],
  ['false', 'KeywordFalse'],
  ['from', 'KeywordFrom'],
  ['if', 'KeywordIf'],
  ['import', 'KeywordImport'],
  ['null', 'KeywordNull'],
  ['pass', 'KeywordPass'],
  ['return', 'KeywordReturn'],
  ['true', 'KeywordTrue'],
  ['type', 'KeywordType'],
  ['while', 'KeywordWhile'],
]);

const lexIdentifier = (state: State): Token | IdentifierToken => {
  const position = { ...state.position };
  let id = state.advance();

  while (!state.eof() && isIdentifierPart(state.current())) {
    id += state.advance();
  }

  const keyword = RESERVED_KEYWORDS.get(id);

  return keyword != null ? { position, kind: keyword } : { position, kind: 'Id', id };
};

const lexEscapeSequence = (state: State): string => {
  let c: string;

  if (state.eof()) {
    throw new Error('Unterminated escape sequence');
  }
  switch ((c = state.advance())) {
    case 'b':
      return '\b';

    case 't':
      return '\t';

    case 'n':
      return '\n';

    case 'f':
      return '\f';

    case 'r':
      return '\r';

    case '"':
    case "'":
    case '\\':
    case '/':
      return c;

    case 'u': {
      let result = 0;

      for (let i = 0; i < 4; ++i) {
        if (state.eof()) {
          throw new Error('Unterminated escape sequence');
        } else if (!/^[a-fA-F0-9]$/.test(state.current())) {
          throw new Error('Illegal Unicode hex escape sequence');
        }
        if (state.current() >= 'A' && state.current() <= 'F') {
          result = result * 16 + (state.advance().codePointAt(0) - 'A'.codePointAt(0) + 10);
        } else if (state.current() >= 'a' && state.current() <= 'f') {
          result = result * 16 + (state.advance().codePointAt(0) - 'a'.codePointAt(0) + 10);
        } else {
          result = result * 16 + (state.advance().codePointAt(0) - '0'.codePointAt(0));
        }
      }

      return String.fromCodePoint(result);
    }

    default:
      throw new Error('Unrecognized escape sequence');
  }
};

const lexStringLiteral = (state: State): StringLiteralToken => {
  const position = { ...state.position };
  let value = '';
  const separator = state.advance();
  let c;

  for (;;) {
    if (state.eof()) {
      throw new Error('Unexpected end of input inside string literal');
    }
    c = state.advance();
    if (c === separator) {
      break;
    } else if (c === '\\') {
      value += lexEscapeSequence(state);
    } else {
      value += c;
    }
  }

  return { position, kind: 'Str', value };
};

const lexNumericLiteral = (state: State): NumberLiteralToken => {
  const position = { ...state.position };
  let buffer = '';
  let kind: 'Float' | 'Int' = 'Int';

  // TODO: Add support for different bases, such as hexadecimal etc.
  do {
    const c = state.advance();

    if (c !== '_') {
      buffer += c;
    }
  } while (!state.eof() && isNumPart(state.current()));

  if (state.peekRead('.')) {
    kind = 'Float';
    buffer += '.';
    if (state.eof() || !/^[0-9]$/.test(state.current())) {
      throw new Error("Missing digits after `.'");
    }
    do {
      const c = state.advance();

      if (c !== '_') {
        buffer += c;
      }
    } while (!state.eof() && isNumPart(state.current()));

    if (state.peekRead('e') || state.peekRead('E')) {
      buffer += 'e';
      if (state.peek('+') || state.peek('-')) {
        buffer += state.advance();
      }
      if (state.eof() || !/^[0-9]$/.test(state.current())) {
        throw new Error("Missing digits after `e'");
      }
      do {
        const c = state.advance();

        if (c !== '_') {
          buffer += c;
        }
      } while (!state.eof() && isNumPart(state.current()));
    }
  }

  return { position, kind, value: buffer };
};

const lexOperator = (state: State): Token => {
  const position = { ...state.position };
  const c = state.advance();
  let kind: TokenKind;

  switch (c) {
    case '.':
      if (state.peekRead('.')) {
        if (!state.peekRead('.')) {
          throw new Error("Unexpected `..'");
        }
        kind = '...';
      } else {
        kind = '.';
      }
      break;

    case ',':
    case ':':
    case ';':
    case '~':
    case '^':
    case '+':
    case '*':
    case '/':
    case '%':
      kind = c;
      break;

    case '!':
      kind = state.peekRead('=') ? '!=' : '!';
      break;

    case '=':
      kind = state.peekRead('=') ? '==' : state.peekRead('>') ? '=>' : '=';
      break;

    case '-':
      kind = state.peekRead('>') ? '->' : '-';
      break;

    case '&':
      kind = state.peekRead('&') ? '&&' : '&';
      break;

    case '|':
      kind = state.peekRead('|') ? '||' : '|';
      break;

    case '<':
      kind = state.peekRead('<') ? '<<' : state.peekRead('=') ? '<=' : '<';
      break;

    case '>':
      kind = state.peekRead('>') ? '>>' : state.peekRead('=') ? '>=' : '>';
      break;

    case '?':
      if (!state.peekRead('.')) {
        throw new Error("Unexpected `?'.");
      }
      kind = '?.';
      break;

    default:
      throw new Error('Unrecognized operator');
  }

  return { position, kind };
};

const lexLogicalLine = (state: State, tokens: Token[], indentStack: Stack<number>): void => {
  const position = { ...state.position };
  let indent = 0;
  let separatorCount = 0;

  // Parse indentation at beginning of line.
  while (state.peek(' ') || state.peek('\t')) {
    indent += state.advance() === '\t' ? 8 : 1;
  }

  // If there is an comment after the initial indentation, skip that and call
  // it a day.
  if (state.peekRead('#')) {
    while (!state.eof()) {
      const c = state.advance();

      if (c === '\n') {
        break;
      }
    }
    return;
  }

  // If it's an empty line, then do nothing else.
  if (state.eof() || state.peekRead('\n')) {
    return;
  }

  // Then check if the indentation has changed from previous line.
  if (indentStack.empty()) {
    if (indent > 0) {
      indentStack.push(indent);
      tokens.push({ position, kind: 'Indent' });
    }
  } else {
    let previousIndent = indentStack.top();

    if (previousIndent > indent) {
      do {
        if (indentStack.empty()) {
          break;
        }
        previousIndent = indentStack.top();
        indentStack.pop();
        tokens.push({ position, kind: 'Dedent' });
        if (previousIndent < indent) {
          throw new Error('Indentation mismatch');
        }
      } while (previousIndent > indent);
    } else if (previousIndent < indent) {
      indentStack.push(indent);
      tokens.push({ position, kind: 'Indent' });
    }
  }

  // Lex tokens after initial indent.
  for (;;) {
    // End of input.
    if (state.eof()) {
      break;
    }

    // End of line.
    if (state.peekRead('\n') && separatorCount === 0) {
      tokens.push({ position: { ...state.position }, kind: 'NewLine' });
      break;
    }

    // Skip whitespace before the next token.
    if (/^\s$/.test(state.current())) {
      state.advance();
      continue;
    }

    // Skip comments.
    if (state.peekRead('#')) {
      while (!state.eof()) {
        const c = state.advance();

        if (c === '\n') {
          break;
        }
      }
      break;
    }

    // Separators.
    if (state.peek('(') || state.peek('[') || state.peek('{')) {
      const position = { ...state.position };
      const c = state.advance() as '(' | '[' | '{';

      ++separatorCount;
      tokens.push({
        position,
        kind: c,
      });
      continue;
    }

    if (state.peek(')') || state.peek(']') || state.peek('}')) {
      const position = { ...state.position };
      const c = state.advance() as ')' | ']' | '}';

      if (separatorCount > 0) {
        --separatorCount;
      }
      tokens.push({
        position,
        kind: c,
      });
      continue;
    }

    // Identifiers
    if (isIdentifierStart(state.current())) {
      tokens.push(lexIdentifier(state));
      continue;
    }

    // String literals
    if (state.peek('"') || state.peek("'")) {
      tokens.push(lexStringLiteral(state));
      continue;
    }

    // TODO: Add support for binary literals

    // Numeric literals
    if (/^[0-9]$/.test(state.current())) {
      tokens.push(lexNumericLiteral(state));
      continue;
    }

    tokens.push(lexOperator(state));
  }
};

export const lex = (source: string): Token[] => {
  const state = new State(source);
  const tokens: Token[] = [];
  const indentStack = new Stack<number>();

  while (!state.eof()) {
    lexLogicalLine(state, tokens, indentStack);
  }
  if (!indentStack.empty()) {
    tokens.push({ position: { ...state.position }, kind: 'NewLine' });
    do {
      indentStack.pop();
      tokens.push({ position: { ...state.position }, kind: 'Dedent' });
    } while (!indentStack.empty());
  }

  return tokens;
};
