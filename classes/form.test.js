const Form = require('./form');
const { registerFunction } = require('../functionStore/functions');

const specification = {
  name: 'testForm',
  fields: [
    {
      name: 'name',
      type: 'text',
      constraints: {
        maxlength: 10
      }
    },
    {
      name: 'age',
      type: 'number',
      constraints: {
        min: 18
      }
    }
  ], serverSideValidators: [
    { function: 'testPromise', promise: true },
    { function: 'testNonPromise' }
  ]
};

beforeAll(() => {
  registerFunction('testPromise', () => new Promise(resolve => resolve(true)))
  registerFunction('testNonPromise', () => true);
});

describe('Form', () => {
  it('creates the correct fields', () => {
    const form = new Form(specification);
    expect(form.fields.length).toBe(2);
    
    const fieldNames = form.fields.map(field => field.name);
    expect(fieldNames[0]).toBe('name');
    expect(fieldNames[1]).toBe('age');

    expect(form.fields[0].type).toBe('text');
    expect(form.fields[1].type).toBe('number');
  });

  it('runs form-level validators', async () => {
    const form = new Form(specification);
    expect((await form.validate({ body: { name: 'abc123' } })).validity).toBe(true);
  });
})