const Form = require('./form');

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
  ]
};

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

  it('validates group fields correctly', async () => {
    const form = new Form({
      name: 'testForm',
      fields: [
        {
          name: 'testGroup',
          type: 'group',
          fields: [
            { name: 'name', type: 'text', constraints: { required: true} },
            { name: 'age', type: 'number', constraints: { min: 18 } }
          ]
        }]
    });

    const validityState = await form.validate({
      body: {
          testGroup: [
            { name: 'Test User', age: 20 },
            { name: 'Test User 2', age: 15 },
            { age: 15 },
            { age: 25 },
            {}
          ]
        }
      }
    );
    const { validity, errors } = validityState;
    expect(validity).toBe(false);
    
    expect(errors.testGroup[0]).toBe(undefined);

    expect(errors.testGroup[1].name).toBe(undefined);
    expect(errors.testGroup[1].age.length).toBe(1);
    expect(errors.testGroup[1].age[0]).toBe('min');
    
    expect(errors.testGroup[2].name.length).toBe(1);
    expect(errors.testGroup[2].name[0]).toBe('required');
    expect(errors.testGroup[2].age.length).toBe(1);
    expect(errors.testGroup[2].age[0]).toBe('min');
    
    expect(errors.testGroup[3].name.length).toBe(1);
    expect(errors.testGroup[3].name[0]).toBe('required');
    expect(errors.testGroup[3].age).toBe(undefined);
    
    expect(errors.testGroup[4].name.length).toBe(1);
    expect(errors.testGroup[4].name[0]).toBe('required');
    expect(errors.testGroup[4].age).toBe(undefined);
  });
});
