const SimpleField = require('./SimpleField');

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

  it('validates multiple constraints correctly', () => {
    const field = new SimpleField(spec);
    expect(field.validate('a'.repeat(4)).validity).toBe(false);
    expect(field.validate('a'.repeat(5)).validity).toBe(true);
    expect(field.validate('a'.repeat(6)).validity).toBe(true);

    expect(field.validate('a'.repeat(9)).validity).toBe(true);
    expect(field.validate('a'.repeat(10)).validity).toBe(true);
    expect(field.validate('a'.repeat(11)).validity).toBe(false);
  });

  it('requires a field if required = true', () => {
    const field = new SimpleField({ ...spec, constraints: { ...spec.constraints, required: true } });
    let validityState = field.validate('');
    expect(validityState.validity).toBe(false);
    expect(validityState.errors).toContain('required');

    validityState = field.validate('a'.repeat(5));
    expect(validityState.validity).toBe(true);
    expect(validityState.errors).not.toContain('required');
  });

  it('does not require a field if required has not been set', () => {
    const field = new SimpleField(spec);
    let validityState = field.validate(undefined);
    expect(validityState.validity).toBe(true);

    validityState = field.validate('12345');
    expect(validityState.validity).toBe(true);
  });

  it('validates a non-mandatory field if a value has been given', () => {
    const field = new SimpleField(spec);
    let validityState = field.validate('1234');
    expect(validityState.validity).toBe(false);
  });

  it('interprets a complex required condition correctly', () => {
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

    expect(field.validate(undefined, { age: { value: 17, fieldType: 'number' }}).validity).toBe(true);
    expect(field.validate(undefined, { age: { value: 18, fieldType: 'number' }}).validity).toBe(false);
    expect(field.validate(undefined, { age: { value: 25, fieldType: 'number' }}).validity).toBe(false);
    expect(field.validate(undefined, { age: { value: 30, fieldType: 'number' }}).validity).toBe(false);
    expect(field.validate(undefined, { age: { value: 31, fieldType: 'number' }}).validity).toBe(true);
  });

  it('interprets a complex required condition with dependencies on multiple fields correctly', () => {
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

    expect(field.validate(undefined, { age: { value: 17, fieldType: 'number' }, name: { value: 'a'.repeat(10), fieldType: 'text'}}).validity).toBe(true);
    expect(field.validate(undefined, { age: { value: 18, fieldType: 'number' }, name: { value: 'a'.repeat(11), fieldType: 'text'}}).validity).toBe(true);
    expect(field.validate(undefined, { age: { value: 18, fieldType: 'number' }, name: { value: 'a'.repeat(5), fieldType: 'text'}}).validity).toBe(false);
  });
});
