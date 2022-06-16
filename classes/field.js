const validators = require('../validators/validators');
const typeValidators = require('../validators/typeValidators');
const { getFunction } = require('../functionStore/functions');
const { INPUT_TYPES } = require('../form-input-types');

const getDependencies = (specification) => {
  const required = specification?.constraints?.required;
  if (Array.isArray(required)) {
    return required.map(constraint => constraint.field).filter(dep => dep);
  }
};

class Field {
  constructor(specification, form) {
    if (!Object.values(INPUT_TYPES).includes(specification.type)) {
      throw new Error(`Field type '${specification.type}' is not supported`);
    }
    
    this.form = form;
    this.name = specification.name;
    this.type = specification.type;
    this.constraints = specification.constraints;
    this.validate = this.validate.bind(this);
    this.dependencies = getDependencies(specification) || [];
  }

  #checkRequiredValidity = (value, dependencies) => {
    const requiredCondition = this.constraints?.required;
    
    if (!requiredCondition)
      return true;
    
    const validator = validators['required'];
    return validator({value, constraintValue: requiredCondition, dependencies});
  }

  #checkTypeValidity(value) {
    const typeValidator = typeValidators[this.type];
  
    if (typeof typeValidator === 'function') {
      return typeValidator(value);
  
    }
    return false;
  }

  #checkConstraintValidity(value, dependencies, errors) {
    if (!this.constraints) return [ true ];
  
    return Object.keys(this.constraints)
      .filter(constraint => !['functions', 'required'].includes(constraint))
      .map(constraint => {
        const validator = validators[constraint];
        const constraintValue = this.constraints[constraint];
        const result = (typeof validator === 'function') ? validator({ type: this.type, value, constraintValue, dependencies }) : false;
        if (!result) {
          errors.push(constraint);
        }
        return result;
      });
  };

  #checkFunctionValidity(value, errors) {
    if (!this.constraints) return [ true ];
  
    return (this.constraints['functions']?.map(func => {
      const result = getFunction(func)(value);
      if (!result) {
        errors.push(func);
      }
      return result;
    })) || [];
  };

  validate(value, dependencies) {
    const errors = [];

    const requiredValidity = this.#checkRequiredValidity(value, dependencies);
    if (!requiredValidity) {
      errors.push('required');
    }   

    let validity = requiredValidity;

    if (value) {
      
      if (!this.#checkTypeValidity(value)) {
        errors.push('type');
      }

      const constraintValidities = this.#checkConstraintValidity(value, dependencies, errors);
      const functionConstraintValidities = this.#checkFunctionValidity(value, errors);
      const validities = constraintValidities.concat(functionConstraintValidities);
      validity = validities.every(isValid => isValid);
    }

    return { validity, errors };
  }
}

module.exports = Field;
 