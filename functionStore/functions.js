const functions = {};

const registerFunction = (name, func) => {
    if (!name || functions[name]) {
        throw new Error(`Custom validator with name '${name}' has already been registered`);
    }
    functions[name] = func;
};

const getFunction = (name) => {
    if (name && functions[name]) {
        return functions[name];
    }
    throw new Error(`Custom validator with name '${name} has not been registered`);
};

module.exports = {
    registerFunction,
    getFunction,
    functions    
};