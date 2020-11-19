// TODO: Add support for non-ASCII alphabetic characters.
export const isIdentifierStart = (c: string): boolean => /^[$_a-zA-Z]$/.test(c);
export const isIdentifierPart = (c: string): boolean => /^[$_a-zA-Z0-9]$/.test(c);
export const isNewLine = (c: string): boolean => /^[\n\r]$/.test(c);
export const isNumPart = (c: string): boolean => /^[0-9_]$/.test(c);
