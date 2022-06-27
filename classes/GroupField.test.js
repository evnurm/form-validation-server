const GroupField = require('./GroupField');

const groupSpec = {
  name: "personGroup",
  type: "group",
  constraints: {
    maxlength: 5
  },
  fields: [
    {
      name: "firstName",
      type: "text",
      html: {
        label: "First name",
        placeholder: "First name"
      },
      constraints: {
        required: true,
        maxlength: 10
      }
    },
    {
      name: "lastName",
      type: "text",
      html: {
        label: "Last name",
        placeholder: "Last name"
      },
      constraints: {
        required: true,
        maxlength: 10
      }
    },
    {
      name: "age",
      type: "number",
      html: {
        label: "Age",
        placeholder: "Age"
      },
      constraints: {
        max: 125,
        min: 15
      }
    }
  ]
};

describe('GroupField', () => {
  it('validates the fields of the group correctly', () => {
    const field = new GroupField(groupSpec);
    expect(field.validate([
      { firstName: 'Test', lastName: 'User', age: 26 }
    ]).validity).toBe(true);

    expect(field.validate([
      { firstName: 'Test', age: 26 }
    ]).validity).toBe(false);

    expect(field.validate([
      { lastName: 'User', age: 26 }
    ]).validity).toBe(false);

    expect(field.validate([
      { firstName: 'Test', lastName: 'User' }
    ]).validity).toBe(true);
  });

  it('validates multiple instances of the field group', () => {
    const field = new GroupField(groupSpec);
    expect(field.validate([
      { firstName: 'Test', lastName: 'User', age: 26 },
      { firstName: 'Second', lastName: 'Person', age: 18 }
    ]).validity).toBe(true);

    expect(field.validate([
      { firstName: 'Test', lastName: 'User', age: 26 },
      { firstName: 'Second', lastName: 'Person', age: 10 }
    ]).validity).toBe(false);
  });
});