const { INPUT_TYPES } = require('../form-input-types');
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
    
    let validityStates;
    const errors = {};
    
    // Detect fields that do not exist in field specification 
    const keys = this.fields.map(field => field.name);
    const unknownKeys = Object.keys(formData).filter(key => !keys.includes(key));
    unknownKeys.forEach(key => errors[key] = 'Unrecognized field');

    // Validate individual fields
    validityStates = await Promise.all(this.fields.map(field => {
      const dependencies = {};
      field.dependencies.forEach(dep => dependencies[dep] = { value: formData[dep], fieldType: this.fields.find(field => field.name === dep)?.type });
      return field.validate(formData[field.name], dependencies);
    }));

    // Add field errors to errors object
    validityStates.forEach(((validityState, index) => {
      if (validityState.errors.length > 0) {
        errors[this.fields[index].name] = validityState.errors;
      }
    }));
  
    const validity = unknownKeys.length === 0 && validityStates.map(validityState => validityState.validity).every(isValid => isValid);
    return { validity, errors };
  }
}

module.exports = Form;
