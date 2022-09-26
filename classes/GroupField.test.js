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
  it('validates the fields of the group correctly', async () => {
    const field = new GroupField(groupSpec);
    
    const allGivenAndValid = await field.validate([
      { firstName: 'Test', lastName: 'User', age: 26 }
    ]);
    expect(allGivenAndValid.validity).toBe(true);

    const lastNameMissing = await field.validate([
      { firstName: 'Test', age: 26 }
    ]);

    expect(lastNameMissing.validity).toBe(false);
    expect(lastNameMissing.errors[0].lastName.length).toBe(1);
    expect(lastNameMissing.errors[0].lastName[0]).toBe('required');

    const firstNameMissing = await field.validate([
      { lastName: 'User', age: 26 }
    ]);

    expect(firstNameMissing.validity).toBe(false);
    expect(firstNameMissing.errors[0].firstName.length).toBe(1);
    expect(firstNameMissing.errors[0].firstName[0]).toBe('required');


    const firstNameAndLastNameMissing = await field.validate([
      { age: 18 }
    ]);
    expect(firstNameAndLastNameMissing.validity).toBe(false);
    expect(firstNameAndLastNameMissing.errors[0].lastName.length).toBe(1);
    expect(firstNameAndLastNameMissing.errors[0].lastName[0]).toBe('required');
    expect(firstNameAndLastNameMissing.errors[0].firstName.length).toBe(1);
    expect(firstNameAndLastNameMissing.errors[0].firstName[0]).toBe('required');

    const namesMissingAndTooYoung = await field.validate([
      { age: 14 }
    ]);
    expect(namesMissingAndTooYoung.validity).toBe(false);
    expect(namesMissingAndTooYoung.errors[0].lastName.length).toBe(1);
    expect(namesMissingAndTooYoung.errors[0].lastName[0]).toBe('required');
    expect(namesMissingAndTooYoung.errors[0].firstName.length).toBe(1);
    expect(namesMissingAndTooYoung.errors[0].firstName[0]).toBe('required');
    expect(namesMissingAndTooYoung.errors[0].age.length).toBe(1);
    expect(namesMissingAndTooYoung.errors[0].age[0]).toBe('min');

    const namesMissingAndTooOld = await field.validate([
      { age: 126 }
    ]);
    expect(namesMissingAndTooOld.validity).toBe(false);
    expect(namesMissingAndTooOld.errors[0].lastName.length).toBe(1);
    expect(namesMissingAndTooOld.errors[0].lastName[0]).toBe('required');
    expect(namesMissingAndTooOld.errors[0].firstName.length).toBe(1);
    expect(namesMissingAndTooOld.errors[0].firstName[0]).toBe('required');
    expect(namesMissingAndTooOld.errors[0].age.length).toBe(1);
    expect(namesMissingAndTooOld.errors[0].age[0]).toBe('max');


    const allRequiredGivenAndValid = await field.validate([
      { firstName: 'Test', lastName: 'User' }
    ]);
    expect(allRequiredGivenAndValid.validity).toBe(true);
  });

  it('validates multiple instances of the field group', async () => {
    const field = new GroupField(groupSpec);
    expect((await field.validate([
      { firstName: 'Test', lastName: 'User', age: 26 },
      { firstName: 'Second', lastName: 'Person', age: 18 }
    ])).validity).toBe(true);

    const secondAgeTooLow = await field.validate([
      { firstName: 'Test', lastName: 'User', age: 26 },
      { firstName: 'Second', lastName: 'Person', age: 10 }
    ]);
    expect(secondAgeTooLow.validity).toBe(false);
    expect(secondAgeTooLow.errors.length).toBe(2);
    expect(secondAgeTooLow.errors[1].firstName).toBe(undefined);
    expect(secondAgeTooLow.errors[1].lastName).toBe(undefined);
    expect(secondAgeTooLow.errors[1].age.length).toBe(1);
    expect(secondAgeTooLow.errors[1].age[0]).toBe('min');
  });
});
