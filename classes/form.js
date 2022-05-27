const Field = require('./field');

class Form {
  #fields = [];

  constructor(specification) {
    if (!specification.fields)
      throw new Error('Fields are not specified');

    this.#fields = specification.fields.map(field => new Field(field));
    this.validate = this.validate.bind(this);
    this.errors = [];
  }

  validate(formData) {
    const validations = this.#fields.map(field => field.validate(formData[field.name]));
    this.#fields.forEach(field => this.errors.push({ [field.name]: field.errors }));
    const isValid = validations.every(isValid => isValid);
    return isValid;
  }
}

module.exports = Form;
