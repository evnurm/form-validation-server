const { getFunction, registerFunction, functions } = require('./functions');

describe('functionStore', () => {
  it('should register a function when registerFunction is called', () => {
    expect(functions['testFunction']).toBe(undefined);
    registerFunction('testFunction', () => { });
    expect(typeof functions['testFunction']).toBe('function');
  });

  it('should register a function when registerFunction is called', () => {
    const testFunction = jest.fn();
    functions['testFunction'] = testFunction;
    const func = getFunction('testFunction');
    func('testValue');
    expect(testFunction).toHaveBeenCalledWith('testValue');
  });
});