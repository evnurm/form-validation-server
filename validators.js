const { INPUT_TYPES } = require('./form-input-types');

const validateStringMaxLength = (value, limit) => {
  return value?.length <= limit;
};

const validateStringMinLength = (value, limit) => {
  return value?.length >= limit;
};

const validateMaxNumber = (value, limit) => {
  return value <= limit;
};

const validateMinNumber = (value, limit) => {
  return value >= limit;
};

const validateStepNumber = (value, step, min) => {
  if (!min) {
    return value % step === 0;
  }
  return (value - min) % step === 0; 
};

const validateMaxDate = (value, limit) => {
  return new Date(value) <= new Date(limit);
};

const validateMinDate = (value, limit) => {
  return new Date(value) >= new Date(limit);
};

const validateStringPattern = (value, regexpString) => {
  const regexp = new RegExp(regexpString);
  return regexp.test(value);
};


const validateMin = ({ value, constraintValue, type }) => {
  switch (type) {
    case INPUT_TYPES.NUMBER: return validateMinNumber(value, constraintValue);
    case INPUT_TYPES.DATE: return validateMinDate(value, constraintValue);
    default: throw new Error('min constraint is not supported for type ' + type);
  }
};

const validateMax = ({ value, constraintValue, type }) => {
  switch (type) {
    case INPUT_TYPES.NUMBER: return validateMaxNumber(value, constraintValue);
    case INPUT_TYPES.DATE: return validateMaxDate(value, constraintValue);
    default: throw new Error('max constraint is not supported for type ' + type);
  }
};

const validateStep = ({ value, constraintValue, type, min }) => {
  switch (type) {
    case INPUT_TYPES.NUMBER: return validateStepNumber(value, constraintValue, min);
    default: throw new Error('step constraint is not supported for type ' + type);
  }
}

const validateMinLength = ({ value, constraintValue, type }) => {
  switch (type) {
    case INPUT_TYPES.TEXT:
    case INPUT_TYPES.EMAIL:
    case INPUT_TYPES.PASSWORD:
    case INPUT_TYPES.SEARCH:
    case INPUT_TYPES.TEL:
    case INPUT_TYPES.URL:
      return validateStringMinLength(value, constraintValue);
    default: throw new Error('minlength constraint is not supported for type ' + type);
  }
};

const validateMaxLength = ({ value, constraintValue, type }) => {
  switch (type) {
    case INPUT_TYPES.TEXT:
    case INPUT_TYPES.EMAIL:
    case INPUT_TYPES.PASSWORD:
    case INPUT_TYPES.SEARCH:
    case INPUT_TYPES.TEL:
    case INPUT_TYPES.URL:
      return validateStringMaxLength(value, constraintValue);
    default: throw new Error('maxlength constraint is not supported for type ' + type);
  }
};

const validatePattern = ({ value, constraintValue, type }) => {
  switch (type) {
    case INPUT_TYPES.TEXT:
    case INPUT_TYPES.EMAIL:
    case INPUT_TYPES.PASSWORD:
    case INPUT_TYPES.SEARCH:
    case INPUT_TYPES.TEL:
    case INPUT_TYPES.URL:
      return validateStringPattern(value, constraintValue);
    default: throw new Error('pattern constraint is not supported for type ' + type);
  }
};

const validateOneOf = ({ value, constraintValue, type }) => {
  switch (type) {
    case INPUT_TYPES.RADIO: return constraintValue.includes(value);
    default: throw new Error('oneOf constraint is not supported for type ' + type);
  }
};

const validateRequired = ({ value, constraintValue, dependencies }) => {
  // Handle boolean values
  if (typeof constraintValue === 'boolean') {
    return constraintValue ? Boolean(value) : true;
  }

  // Handle array of conditions for a field being required
  const constraintValidities = constraintValue.map(constraint => {
    const { type, value, field } = constraint;
    const func = validators[type];
    const dependency = dependencies[field];
    return func({ value, constraintValue: dependency['value'], type: dependency['fieldType'] });
  });

  const allValid = constraintValidities.every(validity => validity);
  if (!allValid) {
    return Boolean(value);
  }
  return true;
};

const validators = {
  'maxlength': validateMaxLength,
  'minlength': validateMinLength,
  'max': validateMax,
  'min': validateMin,
  'step': validateStep,
  'pattern': validatePattern,
  'oneOf': validateOneOf,
  'required': validateRequired
};

module.exports = validators;
