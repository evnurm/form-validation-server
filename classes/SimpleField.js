const AbstractField = require('./AbstractField');

class SimpleField extends AbstractField {
  constructor(specification) {
    super(specification);
    this.name = specification.name;
    this.type = specification.type;
  }

  async validate(value, dependencies) {
    const validity = await super.validate(value, dependencies);
    return validity;
  }
}

module.exports = SimpleField;
