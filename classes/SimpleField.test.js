const SimpleField = require('./SimpleField');
const functionStore = require('../functionStore/functions');

const spec = {
  name: "testField",
  type: "text",
  constraints: { maxlength: 10, minlength: 5 }
};

describe('SimpleField', () => {
  it('has correct members', () => {
    const field = new SimpleField(spec);
    expect(field.name).toBe(spec.name);
    expect(field.type).toBe(spec.type);
    expect(field.constraints).toBe(spec.constraints);
    expect(typeof field.validate).toBe('function');
  });

  it('validates multiple constraints correctly', async () => {
    const field = new SimpleField(spec);
    expect((await field.validate('a'.repeat(4))).validity).toBe(false);
    expect((await field.validate('a'.repeat(5))).validity).toBe(true);
    expect((await field.validate('a'.repeat(6))).validity).toBe(true);

    expect((await field.validate('a'.repeat(9))).validity).toBe(true);
    expect((await field.validate('a'.repeat(10))).validity).toBe(true);
    expect((await field.validate('a'.repeat(11))).validity).toBe(false);
  });

  it('requires a field if required = true', async () => {
    const field = new SimpleField({ ...spec, constraints: { ...spec.constraints, required: true } });
    let validityState = await field.validate('');
    expect(validityState.validity).toBe(false);
    expect(validityState.errors).toContain('required');

    validityState = await field.validate('a'.repeat(5));
    expect(validityState.validity).toBe(true);
    expect(validityState.errors).not.toContain('required');
  });

  it('does not require a field if required has not been set', async () => {
    const field = new SimpleField(spec);
    let validityState = await field.validate(undefined);
    expect(validityState.validity).toBe(true);

    validityState = await field.validate('12345');
    expect(validityState.validity).toBe(true);
  });

  it('validates a non-mandatory field if a value has been given', async () => {
    const field = new SimpleField(spec);
    let validityState = await field.validate('1234');
    expect(validityState.validity).toBe(false);
  });

  it('interprets a complex required condition correctly', async () => {
    const specification = {
      ...spec,
      constraints: {
        required: [
          { type: 'min', value: 18, field: 'age' },
          { type: 'max', value: 30, field: 'age' }
        ]
      }
    };
    const field = new SimpleField(specification);

    expect((await field.validate(undefined, { age: { value: 17, fieldType: 'number' }})).validity).toBe(true);
    expect((await field.validate(undefined, { age: { value: 18, fieldType: 'number' }})).validity).toBe(false);
    expect((await field.validate(undefined, { age: { value: 25, fieldType: 'number' }})).validity).toBe(false);
    expect((await field.validate(undefined, { age: { value: 30, fieldType: 'number' }})).validity).toBe(false);
    expect((await field.validate(undefined, { age: { value: 31, fieldType: 'number' }})).validity).toBe(true);
  });

  it('interprets a complex required condition with dependencies on multiple fields correctly', async () => {
    const specification = {
      ...spec,
      constraints: {
        required: [
          { type: 'min', value: 18, field: 'age' },
          { type: 'maxlength', value: 10, field: 'name' }
        ]
      }
    };
    const field = new SimpleField(specification);

    expect((await field.validate(undefined, { age: { value: 17, fieldType: 'number' }, name: { value: 'a'.repeat(10), fieldType: 'text'}})).validity).toBe(true);
    expect((await field.validate(undefined, { age: { value: 18, fieldType: 'number' }, name: { value: 'a'.repeat(11), fieldType: 'text'}})).validity).toBe(true);
    expect((await field.validate(undefined, { age: { value: 18, fieldType: 'number' }, name: { value: 'a'.repeat(5), fieldType: 'text'}})).validity).toBe(false);
  });

  it('interprets a DNF required condition correctly', async () => {
    const specification = {
          name: 'guardianSsn',
          type: 'text', 
          constraints: {
            required: [
              [
                { type: 'max', value: 17, field: 'age' }
              ],
              [
                { type: 'min', value: 18, field: 'age' },
                { type: 'equals', value: true, field: 'requiresGuardian' }
              ]
            ]
          }
    };

    const field = new SimpleField(specification);
    expect((await field.validate(undefined, { age: { value: 17, fieldType: 'number' }, requiresGuardian: { value: true, fieldType: 'radio-group' }})).validity).toBe(false);
    expect((await field.validate(undefined, { age: { value: 17, fieldType: 'number' }, requiresGuardian: { value: false, fieldType: 'radio-group' }})).validity).toBe(false);
    expect((await field.validate(undefined, { age: { value: 17, fieldType: 'number' }, requiresGuardian: { value: undefined, fieldType: 'radio-group' }})).validity).toBe(false);
    expect((await field.validate(undefined, { age: { value: 18, fieldType: 'number' }, requiresGuardian: { value: false, fieldType: 'radio-group' } })).validity).toBe(true);
    expect((await field.validate(undefined, { age: { value: 18, fieldType: 'number' }, requiresGuardian: { value: true, fieldType: 'radio-group' } })).validity).toBe(false);
    expect((await field.validate(undefined, { age: { value: 18, fieldType: 'number' }, requiresGuardian: { value: undefined, fieldType: 'radio-group' } })).validity).toBe(true);
    expect((await field.validate(undefined, { age: { value: 19, fieldType: 'number' }, requiresGuardian: { value: false, fieldType: 'radio-group' } })).validity).toBe(true);
    expect((await field.validate(undefined, { age: { value: 19, fieldType: 'number' }, requiresGuardian: { value: true, fieldType: 'radio-group' } })).validity).toBe(false);
    expect((await field.validate(undefined, { age: { value: 19, fieldType: 'number' }, requiresGuardian: { value: undefined, fieldType: 'radio-group' } })).validity).toBe(true);

    // Required validity = true if a value is given
    expect((await field.validate('test', { age: { value: 17, fieldType: 'number' }, requiresGuardian: { value: true, fieldType: 'radio-group' }})).validity).toBe(true);
    expect((await field.validate('test', { age: { value: 17, fieldType: 'number' }, requiresGuardian: { value: false, fieldType: 'radio-group' }})).validity).toBe(true);
    expect((await field.validate('test', { age: { value: 17, fieldType: 'number' }, requiresGuardian: { value: undefined, fieldType: 'radio-group' }})).validity).toBe(true);
    expect((await field.validate('test', { age: { value: 18, fieldType: 'number' }, requiresGuardian: { value: false, fieldType: 'radio-group' } })).validity).toBe(true);
    expect((await field.validate('test', { age: { value: 18, fieldType: 'number' }, requiresGuardian: { value: true, fieldType: 'radio-group' } })).validity).toBe(true);
    expect((await field.validate('test', { age: { value: 18, fieldType: 'number' }, requiresGuardian: { value: undefined, fieldType: 'radio-group' } })).validity).toBe(true);
    expect((await field.validate('test', { age: { value: 19, fieldType: 'number' }, requiresGuardian: { value: false, fieldType: 'radio-group' } })).validity).toBe(true);
    expect((await field.validate('test', { age: { value: 19, fieldType: 'number' }, requiresGuardian: { value: true, fieldType: 'radio-group' } })).validity).toBe(true);
    expect((await field.validate('test', { age: { value: 19, fieldType: 'number' }, requiresGuardian: { value: undefined, fieldType: 'radio-group' } })).validity).toBe(true);
  });

  it('validates a single function constraint correctly', async () => {
    jest.spyOn(functionStore, 'getFunction').mockImplementation(() => (value) => {
      return value.startsWith('X');
    });

    const specification = {
      ...spec,
      constraints: {
        serverSideFunctions: ['testFunction']
      }
    };
    const field = new SimpleField(specification);
    expect((await field.validate('')).validity).toBe(true);
    expect((await field.validate('a')).validity).toBe(false);
    expect((await field.validate('aXb')).validity).toBe(false);
    expect((await field.validate('X')).validity).toBe(true);
    expect((await field.validate('Xabc')).validity).toBe(true);
  });

  it('validates multiple function constraints correctly', async () => {
    const startsWithX = (value) => value.startsWith('X');
    const endsWithY = (value) => value.endsWith('Y');

    jest.spyOn(functionStore, 'getFunction').mockImplementation((functionName) => {
      switch (functionName) {
        case 'startsWithX':
          return startsWithX;
        case 'endsWithY':
          return endsWithY;
      }
    });

    const specification = {
      ...spec,
      type: 'number',
      constraints: {
        serverSideFunctions: ['startsWithX', 'endsWithY']
      },
    };

    const field = new SimpleField(specification);
    expect((await field.validate('')).validity).toBe(true);
    expect((await field.validate('a')).validity).toBe(false);
    expect((await field.validate('aXb')).validity).toBe(false);
    expect((await field.validate('X')).validity).toBe(false);
    expect((await field.validate('Xabc')).validity).toBe(false);
    expect((await field.validate('XabcY')).validity).toBe(true);
    expect((await field.validate('XabcYz')).validity).toBe(false);
  });

  it('runs form-level validators correctly', async () => {
    const formLevelValidator = (value, dependencies) => {
      return dependencies.dependencyField !== value;
    };
    jest.spyOn(functionStore, 'getFunction').mockImplementation(() => formLevelValidator);

    const specification = {
      ...spec,
      constraints: {
        serverSideFunctions: ['formLevelValidator']
      },
      dependencies: ['dependencyField']
    };

    const field = new SimpleField(specification);
    expect((await field.validate(3, { dependencyField: { type: 'number', value: 3 }})).validity).toBe(false);
    expect((await field.validate(3, { dependencyField: { type: 'number', value: 5 }})).validity).toBe(true);
  });

  it('runs synchronous and non-synchronous custom validators', async () => {
    const validator1 = (value) => value < 11;
    const validator2 = (value) => new Promise((resolve) => resolve(value > 9));

    jest.spyOn(functionStore, 'getFunction').mockImplementation((functionName) =>  functionName === 'validator1' ? validator1 : validator2);

    const specification = {
      ...spec,
      constraints: {
        serverSideFunctions: ['validator1', 'validator2']
      },
      dependencies: ['dependencyField']
    };
    const field = new SimpleField(specification);
    
    expect((await field.validate(9)).validity).toBe(false);
    expect((await field.validate(10)).validity).toBe(true);
    expect((await field.validate(11)).validity).toBe(false);
  })
});
