import { lex } from './lexer';

describe('lex()', () => {
  it.each([[''], ['    '], ['\n\n']])('should return empty array if source code is blank', input => {
    expect(lex(input)).toHaveLength(0);
  });

  it('should detect indentation when it increased from previous line', () => {
    const result = lex('  foo');

    expect(result).toHaveLength(4);
    expect(result).toHaveProperty([0, 'kind'], 'Indent');
  });

  it('should detect indentation when it decreased from previous line', () => {
    const result = lex('  foo\nbar');

    expect(result).toHaveLength(5);
    expect(result).toHaveProperty([3, 'kind'], 'Dedent');
  });

  it('should skip comments', () => {
    expect(lex('# test\n')).toHaveLength(0);
  });

  it('should detect line terminators', () => {
    const result = lex('foo\nbar\nbaz\nquux');

    expect(result).toHaveLength(7);
    expect(result).toHaveProperty([1, 'kind'], 'NewLine');
    expect(result).toHaveProperty([3, 'kind'], 'NewLine');
    expect(result).toHaveProperty([5, 'kind'], 'NewLine');
  });

  it.each([['('], [')'], ['['], [']'], ['{'], ['}'], ['.'], ['?.'], [','], [':'], [';'], ['->'], ['=>'], ['...']])(
    'should be able to lex separators',
    input => {
      const result = lex(input);

      expect(result).toHaveLength(1);
      expect(result).toHaveProperty([0, 'kind'], input);
    },
  );

  it.each([
    ['='],
    ['+'],
    ['-'],
    ['*'],
    ['/'],
    ['%'],
    ['&'],
    ['|'],
    ['!'],
    ['~'],
    ['=='],
    ['!='],
    ['<'],
    ['>'],
    ['<='],
    ['>='],
    ['^'],
    ['<<'],
    ['>>'],
    ['&&'],
    ['||'],
  ])('should be able to lex operators', input => {
    const result = lex(input);

    expect(result).toHaveLength(1);
    expect(result).toHaveProperty([0, 'kind'], input);
  });

  it.each([['foo'], ['_foo'], ['_foo_500']])('should be able to lex identifiers', id => {
    const result = lex(id);

    expect(result).toHaveLength(1);
    expect(result).toHaveProperty([0, 'kind'], 'Id');
    expect(result).toHaveProperty([0, 'id'], id);
  });

  it.each([
    ['""', ''],
    ["''", ''],
    ['"foo"', 'foo'],
    ['"foo\nbar"', 'foo\nbar'],
  ])('should be able to lex string literals', (input, expectedValue) => {
    const result = lex(input);

    expect(result).toHaveLength(1);
    expect(result).toHaveProperty([0, 'kind'], 'Str');
    expect(result).toHaveProperty([0, 'value'], expectedValue);
  });

  it.each([
    ['0', '0'],
    ['1000', '1000'],
    ['1_000_000', '1000000'],
  ])('should be able to lex integer literals', (input, expectedValue) => {
    const result = lex(input);

    expect(result).toHaveLength(1);
    expect(result).toHaveProperty([0, 'kind'], 'Int');
    expect(result).toHaveProperty([0, 'value'], expectedValue);
  });

  it.each([
    ['0.0', '0.0'],
    ['5.5555', '5.5555'],
    ['5.55_55', '5.5555'],
    ['6.67e-11', '6.67e-11'],
    ['6.67E-11', '6.67e-11'],
    ['6.67e+11', '6.67e+11'],
  ])('should be able to lex float literals', (input, expectedValue) => {
    const result = lex(input);

    expect(result).toHaveLength(1);
    expect(result).toHaveProperty([0, 'kind'], 'Float');
    expect(result).toHaveProperty([0, 'value'], expectedValue);
  });
});
