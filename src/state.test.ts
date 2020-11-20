import State from './state';

describe('class State', () => {
  it('should return \\r\\n as \\n', () => {
    const state = new State('\r\n');

    expect(state.advance()).toBe('\n');
  });

  it('should throw an exception when EOF has been reached', () => {
    const state = new State('');

    expect(() => state.advance()).toThrowError();
  });
});
