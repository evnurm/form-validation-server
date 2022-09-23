const validators = require('../validators/validators');
const typeValidators = require('../validators/typeValidators');
const functionStore = require('../functionStore/functions');

const getDependencies = (specification) => {
  const required = specification?.constraints?.required;
  let dependencies = new Set(specification?.dependencies);
  if (Array.isArray(required)) {
    required.map(constraint => constraint.field).filter(dep => dep).forEach(dep => dependencies.add(dep));
  }
  return dependencies;
};

class AbstractField {
  constructor(specification) {
    this.name = specification.name;
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
      .filter(constraint => !['clientSideFunctions', 'serverSideFunctions', 'required'].includes(constraint))
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

  async #checkFunctionValidity(value, dependencies, errors) {
    if (!this.constraints || !this.constraints?.serverSideFunctions) return [ true ];

    // Convert dependencies to format { fieldName: fieldValue }
    const dependencyFieldValues = {};
    Object.keys(dependencies || {}).forEach(dep => dependencyFieldValues[dep] = dependencies[dep].value);

    const validationResults = (
      await Promise.allSettled(
        this.constraints?.serverSideFunctions
          ?.map(func => functionStore.getFunction(func)(value, dependencyFieldValues))
      )
    )?.map(({ value }) => value);

    validationResults.forEach((result, funcIndex) => {
      if (!result) {
        errors.push(this.constraints.serverSideFunctions[funcIndex]);
      }
    });
    return validationResults;
  };

  async validate(value, dependencies) {
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
      const functionConstraintValidities = await this.#checkFunctionValidity(value, dependencies, errors);
      const validities = constraintValidities.concat(functionConstraintValidities);
      validity = validities.every(isValid => isValid);
    }
    return { validity, errors };
  }
}

module.exports = AbstractField;
 