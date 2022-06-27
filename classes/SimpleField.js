const AbstractField = require('./AbstractField');

class SimpleField extends AbstractField {
  constructor(specification) {
    super(specification);
    this.name = specification.name;
    this.type = specification.type;
  }

  validate(value, dependencies) {
    return super.validate(value, dependencies);
  }
}

module.exports = SimpleField;
