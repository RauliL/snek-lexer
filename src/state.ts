import { Position } from './types';
import { isNewLine } from './utils';

export default class State {
  public readonly position: Position;
  private readonly source: string;
  private offset: number;

  public constructor(source: string) {
    this.position = { line: 1, column: 1 };
    this.source = source;
    this.offset = 0;
  }

  public eof(): boolean {
    return this.offset >= this.source.length;
  }

  public current(): string | undefined {
    return this.source[this.offset];
  }

  public peek(expectedChar: string, offset: number = 0): boolean {
    return (
      this.offset + offset < this.source.length &&
      this.source[this.offset + offset] === expectedChar
    );
  }

  public peekRead(expectedChar: string): boolean {
    if (!this.peek(expectedChar)) {
      return false;
    }
    this.advance();

    return true;
  }

  public advance(): string {
    if (!this.eof()) {
      const c = this.source[this.offset++];

      if (isNewLine(c)) {
        if (c === '\r') {
          this.peekRead('\n');
        }
        ++this.position.line;
        this.position.column = 1;

        return '\n';
      }
      ++this.position.column;

      return c;
    }

    throw new Error('Unexpected end of input');
  }
}
