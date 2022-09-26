const AbstractField = require('./AbstractField');
const SimpleField = require('./SimpleField');

class GroupField extends AbstractField {
  #fields;
  constructor(specification) {
    if (!specification.fields) throw new Error('Group field must contain property "fields"');
    super(specification);
    this.name = specification.name;
    this.type = specification.type;
    this.#fields = specification.fields.map(fieldSpec => new SimpleField(fieldSpec));
  }

  async validate(value, dependencies) {
    const superValidity = await super.validate(value, dependencies);
  
    if (superValidity.validity && value) {

      const validityStates = [];

      for (const groupInstance of value) {
        validityStates.push(await Promise.all(this.#fields.map(field => field.validate(groupInstance[field.name], dependencies))));
      }
      const allValid = validityStates.map(instance => instance.map(field => field.validity).every(valid => valid)).every(valid => valid)

      const groupErrors = [];
      validityStates.forEach((instance, instanceIndex) => {
        instance.forEach((field, fieldIndex) => {
          if (field.errors.length > 0) {
            if (!groupErrors[instanceIndex])
              groupErrors[instanceIndex] = {};
            groupErrors[instanceIndex][this.#fields[fieldIndex].name] = field.errors;
          }
        });
        
      });
      return { validity: allValid, errors: groupErrors };
    }

    return superValidity;
  }
}

module.exports = GroupField;
