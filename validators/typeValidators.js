const { INPUT_TYPES } = require('../form-input-types');

const validateText = (value) => typeof value === 'string';

const validateNumber = (value) => typeof value === 'number';

const validateDate = (value) => !Number.isNaN(Date.parse(value));

const validateEmail = (value) => {
    const isString = validateText(value);
    
    // Regex source:  https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return isString && emailRegex.test(value);
};    

const validateMonth = (value) => {
    if (!validateText(value)) return false;
    if (value[4] !== '-') return false;

    const year = Number(value.substring(0, 4));
    const month = Number(value.substring(5));

    return !Number.isNaN(year) && !Number.isNaN(month) && month >= 1 && month <= 12;
};

const validateWeek = (value) => {
    if (!validateText(value)) return false;
    if (value[4] !== '-' || value[5] !== 'W') return false;

    const year = Number(value.substring(0, 4));
    const week = Number(value.substring(6));

    return !Number.isNaN(year) && !Number.isNaN(week) && week >= 1 && week <= 52;
};

const validateURL = (value) => {
    try {
        new URL(value);
        return true;
    } catch (err) {
        return false;
    }
};

module.exports = {
    [INPUT_TYPES.TEXT]: validateText,
    [INPUT_TYPES.NUMBER]: validateNumber,
    [INPUT_TYPES.DATE]: validateDate,
    [INPUT_TYPES.DATETIME_LOCAL]: validateDate,
    [INPUT_TYPES.MONTH]: validateMonth,
    [INPUT_TYPES.EMAIL]: validateEmail,
    [INPUT_TYPES.WEEK]: validateWeek,
    [INPUT_TYPES.URL]: validateURL,
    
    // No separate validation: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/tel
    [INPUT_TYPES.TEL]: validateText
};
