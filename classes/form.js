const Field = require('./field');

class Form {
  fields = [];

  constructor(specification) {
    if (!specification.fields)
      throw new Error('Fields are not specified');

    this.fields = specification.fields.map(field => new Field(field, this));
    this.validate = this.validate.bind(this);
  }

  validate(formData) {
    const errors = {};
    const validations = this.fields.map(field => {
      const dependencies = {};
      field.dependencies.forEach(dep => dependencies[dep] = { value: formData[dep], fieldType: this.fields.find(field => field.name === dep)?.type });
      const validityState = field.validate(formData[field.name], dependencies);
      if (validityState.errors.length > 0) errors[field.name] = validityState.errors;
      return validityState.validity;
    });
    const validity = validations.every(isValid => isValid);
    return { validity, errors };
  }
}

module.exports = Form;
