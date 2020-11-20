import { isNewLine, isNumPart } from './utils';

describe('isNewLine()', () => {
  it.each([
    ['\n', true],
    ['\r', true],
    ['\f', false],
    ['a', false],
  ])('should be able to detect line terminators', (input, expectedResult) => {
    expect(isNewLine(input)).toBe(expectedResult);
  });
});

describe('isNumPart()', () => {
  it.each([
    ['5', true],
    ['0', true],
    ['_', true],
    ['a', false],
    ['#', false],
  ])('should only accept digits and underscore', (input, expectedResult) => {
    expect(isNumPart(input)).toBe(expectedResult);
  });
});
