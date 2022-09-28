const Form = require('./classes/form');
const { registerFunction } = require('./functionStore/functions');

const forms = {};

const registerForm = (formSpec) => {
    const formName = formSpec?.name;
    if (!formName) {
        throw new Error('Form specification is missing the name attribute');
    }

    const form = forms[formName];
    if (form) {
        throw new Error(`A form with name '${formName} already exists`);
    }

    forms[formName] = new Form(formSpec);
};

const getForm = (name) => {
    const form = forms[name];
    if (!form) throw new Error(`Form with name '${name}' does not exist`);
    return forms[name];
};

module.exports = { getForm, registerForm, registerFunction };
