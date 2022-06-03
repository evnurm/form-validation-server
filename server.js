const express = require('express');
const app = express();
const PORT = 3000;
const formValidator = require('./formValidator');
const { validateSsn } = require('./custom-validators/ssn');

formValidator.registerFunction('validateSsn', validateSsn);

app.use(express.json());

app.post('/form', (req, res) => {
    const form = formValidator.getForm('person');
    const validity = form.validate(req.body);
    return res.json(validity);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on('SIGINT', () => process.exit());
