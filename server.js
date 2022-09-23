const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
const formValidator = require('./formValidator');
const { validateSsn, validateGuardianSsn } = require('./custom-validators/ssn');

formValidator.registerFunction('validateSsn', validateSsn);
formValidator.registerFunction('validateGuardianSsn', validateGuardianSsn);

app.use(cors());
app.use(express.json());

app.post('/form', async (req, res) => {
    const form = formValidator.getForm('person');
    const validity = await form.validate(req);
    return res.json(validity);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on('SIGINT', () => process.exit());
