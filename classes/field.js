const validators = require("../validators");
const { getFunction } = require('../functions');

class Field {
  constructor(specification) {
    this.name = specification.name;
    this.type = specification.type;
    this.constraints = specification.constraints;
    this.validate = this.validate.bind(this);
  }

  validate(value) {
    const errors = [];
    const constraintValidities = Object.keys(this.constraints)
      .filter(constraint => constraint !== 'functions')
      .map(constraint => {
        const validator = validators[constraint];
        const constraintValue = this.constraints[constraint];
        const result = (typeof validator === 'function') ? validator({ type: this.type, value, constraintValue }) : false;
        if (!result) {
          errors.push(constraint);
        }
        return result;
      });

    constraintValidities.concat(this.constraints['functions']?.map(func => {
      const result = getFunction(func)(value);
      if (!result) {
        errors.push(func);
      }
      return result;
    }));

    return { validity: constraintValidities.every(isValid => isValid), errors };
  }
}

module.exports = Field;
