const AbstractField = require('./AbstractField');
const SimpleField = require('./SimpleField');

class GroupField extends AbstractField {
  #fields;
  constructor(specification) {
    if (!specification.fields) throw new Error('Group field must contain property "fields"');
    super(specification);
    this.name = specification.name;
    this.type = specification.type;
    this.#fields = specification.fields.map(fieldSpec => new SimpleField(fieldSpec));
  }

  validate(value, dependencies) {
    const superValidity = super.validate(value, dependencies);
  
    if (superValidity.validity && value) {
      const errors = superValidity.errors;

      const subfieldsAreValid = value.map(val =>
        this.#fields.map(field => {
          const validityState = field.validate(val[field.name], dependencies);
          errors.push(validityState.errors);
          return validityState.validity;
        }
        ).every(isValid => isValid)
      ).every(isValid => isValid);

      return { validity: subfieldsAreValid, errors };
    }

    return superValidity;
  }
}

module.exports = GroupField;
