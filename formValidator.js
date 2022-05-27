const Form = require('./classes/form');
const formSpec = require('./form.json');
const { registerFunction } = require('./functions');

const forms = { [formSpec.name]: formSpec };

const getForm = (name) => {
    const form = forms[name];
    if (!form) throw new Error(`Form with name '${name}' does not exist`);
    return new Form(forms[name]);
};

module.exports = { getForm, registerFunction };
