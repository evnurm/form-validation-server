const { INPUT_TYPES } = require('../form-input-types');
const { getFunction } = require('../functionStore/functions');
const GroupField = require('./GroupField');
const SimpleField = require('./SimpleField');

class Form {
  fields = [];
  #serverSideValidators = [];

  constructor(specification) {
    if (!specification.fields)
      throw new Error('Fields are not specified');

    this.fields = specification.fields.map(field => {
      return field.type === INPUT_TYPES.GROUP ? new GroupField(field) : new SimpleField(field);
    });
    this.#serverSideValidators = specification.serverSideValidators;
    this.validate = this.validate.bind(this);
  }

  async #runFormLevelCustomValidators(request) {
    if (!this.#serverSideValidators) return true;

    const promiseResults = await Promise.all(
      this.#serverSideValidators
        .filter(validator => validator.promise)
        .map(validator => getFunction(validator.function)(request))
    );

    const nonPromiseResults = this.#serverSideValidators
      ?.filter(validator => !validator.promise)
      ?.map(validator => getFunction(validator.function)(request)
      );

    return [...promiseResults, ...nonPromiseResults].every(isValid => isValid);
  }

  async validate(request) {
    const formData = request.body;
    const errors = {};
    const validations = this.fields.map(field => {
      const dependencies = {};
      field.dependencies.forEach(dep => dependencies[dep] = { value: formData[dep], fieldType: this.fields.find(field => field.name === dep)?.type });
      const validityState = field.validate(formData[field.name], dependencies);
      if (validityState.errors.length > 0) errors[field.name] = validityState.errors;
      return validityState.validity;
    });
    
    const customValidatorsValidity = await this.#runFormLevelCustomValidators(request);
    const validity = validations.every(isValid => isValid) && customValidatorsValidity;
    return { validity, errors };
  }
}

module.exports = Form;
