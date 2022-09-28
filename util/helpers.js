// DNF = disjunctive normal form
const checkDNFRequiredCondition = (constraintValue, dependencies, validators) => {
  return constraintValue.map(constraintArray => checkArrayRequiredCondition(constraintArray, dependencies, validators)).some(x => x);
};
  
const checkArrayRequiredCondition = (constraintValue, dependencies, validators) => {
  const constraintValidities = constraintValue.map(constraint => {
    const { type, value, field } = constraint;
    const func = validators[type];
    const dependency = dependencies[field];
    return func({ value: dependency?.value, constraintValue: value, type: dependency.fieldType });
  });
  const allValid = constraintValidities.every(validity => validity);

  return allValid;
};
  
module.exports = { checkDNFRequiredCondition, checkArrayRequiredCondition };
