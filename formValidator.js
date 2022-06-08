const Form = require('./classes/form');
const formSpec = require('./form.json');
const { registerFunction } = require('./functionStore/functions');

const forms = { [formSpec.name]: new Form(formSpec) };

const getForm = (name) => {
    const form = forms[name];
    if (!form) throw new Error(`Form with name '${name}' does not exist`);
    return forms[name];
};

module.exports = { getForm, registerFunction };
