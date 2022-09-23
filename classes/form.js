const { INPUT_TYPES } = require('../form-input-types');
const { getFunction } = require('../functionStore/functions');
const GroupField = require('./GroupField');
const SimpleField = require('./SimpleField');

class Form {
  fields = [];

  constructor(specification) {
    if (!specification.fields)
      throw new Error('Fields are not specified');

    this.fields = specification.fields.map(field => {
      return field.type === INPUT_TYPES.GROUP ? new GroupField(field) : new SimpleField(field);
    });
    this.validate = this.validate.bind(this);
  }

  async validate(request) {
    const formData = request.body;
    const errors = {};
    const validityStates = await Promise.all(this.fields.map(field => {
      const dependencies = {};
      field.dependencies.forEach(dep => dependencies[dep] = { value: formData[dep], fieldType: this.fields.find(field => field.name === dep)?.type });
      return field.validate(formData[field.name], dependencies);
    }));

    validityStates.forEach((validityState) => {
      if (validityState.errors.length > 0) errors[field.name] = validityState.errors;
      return validityState.validity;
    });
  
    const validity = validityStates.map(validityState => validityState.validity).every(isValid => isValid);
    return { validity, errors };
  }
}

module.exports = Form;
