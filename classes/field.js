const validators = require('../validators/validators');
const typeValidators = require('../validators/typeValidators');
const { getFunction } = require('../functionStore/functions');

const getDependencies = (specification) => {
  const required = specification?.constraints?.required;
  if (Array.isArray(required)) {
    return required.map(constraint => constraint.field).filter(dep => dep);
  }
};

const checkRequiredValidity = (value, requiredCondition, dependencies) => {
  if (!requiredCondition)
    return true;
  
  const validator = validators['required'];
  return validator({value, constraintValue: requiredCondition, dependencies});
}

const checkTypeValidity = (type, value) => {
  const typeValidator = typeValidators[type];

  if (typeof typeValidator === 'function') {
    return typeValidator(value);

  }
  return false;
}

const checkConstraintValidity = (type, value, constraints, dependencies, errors) => {
  if (!constraints) return [ true ];

  return Object.keys(constraints)
    .filter(constraint => !['functions', 'required'].includes(constraint))
    .map(constraint => {
      const validator = validators[constraint];
      const constraintValue = constraints[constraint];
      const result = (typeof validator === 'function') ? validator({ type, value, constraintValue, dependencies }) : false;
      if (!result) {
        errors.push(constraint);
      }
      return result;
    });
};

const checkFunctionValidity = (constraints, value, errors) => {
  if (!constraints) return [ true ];

  return (constraints['functions']?.map(func => {
    const result = getFunction(func)(value);
    if (!result) {
      errors.push(func);
    }
    return result;
  })) || [];
};

class Field {
  constructor(specification, form) {
    this.form = form;
    this.name = specification.name;
    this.type = specification.type;
    this.constraints = specification.constraints;
    this.validate = this.validate.bind(this);
    this.dependencies = getDependencies(specification) || [];
  }

  validate(value, dependencies) {
    const errors = [];

    const requiredValidity = checkRequiredValidity(value, this.constraints?.required, dependencies);
    if (!requiredValidity) {
      errors.push('required');
    }   

    let validity = requiredValidity;

    if (value) {
      
      if (!checkTypeValidity(this.type, value)) {
        errors.push('type');
      }

      const constraintValidities = checkConstraintValidity(this.type, value, this.constraints, dependencies, errors);
      const functionConstraintValidities = checkFunctionValidity(this.constraints, value, errors);
      const validities = constraintValidities.concat(functionConstraintValidities);
      validity = validities.every(isValid => isValid);
    }

    return { validity, errors };
  }
}

module.exports = Field;
