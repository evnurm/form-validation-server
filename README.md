# form-validation-server

A Node.js tool for performing server-side form validation in a declarative manner by generating validation code from a JSON specification. It is intended to be used alongside [`form-validation-client`](https://github.com/evnurm/form-validation-client) to allow re-use of validation logic on client and server and thus avoid duplicating the code that performs form validation logic.

## Usage

### Setting up the form validator

```javascript
// Require JSON specifications
const formSpec = require('path/to/formSpec.json');
...

// Import the formValidator object
const formValidator = require('./formValidator');
...

// Register form specifications to make formValidator aware of the specification
formValidator.registerForm(formSpec);
...


// Register custom validator functions that are used in the specification
formValidator.registerFunction('functionNameInSpec', customValidatorFunction);

``` 

### Using the form validator

The form validator can be used by fetching a form object from `formValidator` by using its `getForm` method.
The returned object will contain an async `validate` method. The form can be validated by calling the method
with the request object as a parameter (use `await` to wait for the results of the asynchronous validation process).

The `validate` method returns an object with two fields: `validity` and `errors`. `validity` is a simple boolean
value indicating the validity of the form while `errors` is an object which contains the constraint violations of
invalid fields.

```javascript
router.post('/endpoint', async (req, res) => {
  const form = formValidator.getForm('formName');
  const { validity, errors } = await form.validate(req);
  
  if (validity)
    res.status(201).end();
  else
    res.status(400).json({ message: 'Invalid form', errors });
});
```

## Form specification

`formValidator` uses a JSON-based specification file to define the fields of the form. The form specification consists of the name of the form as well as a list of the form's field definitions. The field definitions contain the name, type and constraints of a field. The following is an example of a form specification that defines form with the name *personForm*, a text field for a person's name and a number field for a person's age. 

```json
{
  "name": "personForm",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "constraints": {
        "required": true,
        "maxlength": 50
      }
    },
    { 
      "name": "age",
      "type": "number",
      "constraints": {
        "min": 18,
        "max": 125,
        "required": true
      }
    }
  ]
}
````

A field definition must contain the `name` and `type` attributes. In addition to these fields, a `constraints` object can be provided to define constraints on the value of a field. The `required` constraint can be defined for any field type while other constraints can only be applied to certain field types (e.g. `max` can only be defined for fields that contain a numeric value).

### Field types

The specification supports the following HTML input types:
|HTML input type|Form specification type (JSON)|
|----|----|
|button|button|
|checkbox|checkbox|
|color|color|
|date|date|
|datetime-local|datetime-local|
|email|email|
|file|file|
|hidden|hidden|
|image|image|
|month|month|
|number|number|
|password|password|
|range|range|
|reset|reset|
|search|search|
|select|select|
|submit|submit|
|tel|tel|
|text|text|
|textarea|textarea|
|time|time|
|url|url|
|week|week|

In addition to HTML types, the specification supports groups of checkboxes and radio buttons as well as groups of simple fields:

|Input type|Form specification type (JSON)|
|----|---|
|checkbox group|checkbox-group|
|radio group|radio-group|
|group|group|

## Constraints

The validator supports the following constraints:

| Constraint | Explanation                                             | Input types | Type |
|------------|---------------------------------------------------------|-------------| ---- |
| maxlength  | The maximum length of a field             | text, textarea, email, password, search, tel, url, (group) | number
| minlength  | The minimum length of a field             | text, textarea, email, password, search, tel, url, (group) | number
| max        | The maximum value of a field              | number, date                                               | number
| min        | The minimum value of a field              | number, date                                               | number
| step       | The difference between allowed numeric values | number                                                 | number
| pattern    | A regular expression the value of a field must satisfy | text, email, password, search, tel, url       | regexp string
| values     | The set of allowed values for a field     | radio-group, select, checkbox-group                        | [values array](#values-constraint)
| required   | Indicates whether a field is required or not | all types                                               | [required constraint](#required-constraint)
| equals     | The value of the field must equal the given value | all types                                          | string, number, boolean


### Values constraint

The value of a `values` constraint is an array that contains objects that describe the labels and values of the available options. The labels are not relevant in server-side validation context as they are only used on client-side. The following is an example of a `values` object.

```json
[
  {
    "label": "Option 1",
    "value": 1
  },
  {
    "label": "Option 2",
    "value": 2
  }

]
```

### Required constraint

The required constraint value can be one of many options. These options are:
1. a boolean (true/false). If false, the required constraint may be omitted.
2. an array of condition objects.
3. a boolean expression in disjunctive normal form (DNF). These conditions can be expressed as an array of arrays of condition objects (option 2).

A condition object is a JSON object that contains 3 fields: the type of the condition, a value for the condition and the field that the condition applies to. The type must be one of the constraints (maxlength, minlength etc.). The value must be a valid value for the constraint/type. The field must be the name of one of the fields in the specification.
```json
{ 
  "field": "age",
  "type": "max",
  "value": 17
}
```

A DNF condition can be expressed as an array of arrays of condition object, i.e. `[[conditionObject1, conditionObject2], [conditionObject3]]`. This will be interpreted as `(conditionObject1 AND conditionObject2) OR conditionObject3`.

## Custom validators

The form validator supports custom validators to enable validation checks that are not possible with the basic validation constraints. Examples of this include comparing the value of an input field to the value of another field and asynchronous processes such as checking against a database.

### In form specification

Custom validators can be used to validate a field by including the name of a function in the `serverSideFunctions` constraint as demonstrated in the field specification below:

```json
{
  "name": "socialSecurityNumber",
  "type": "text",
  "constraints": {
    "serverSideFunctions": ["validateSocialSecurityNumber"]
  }
}
```

To make `formValidator` call this function, `formValidator` must be made aware of the function by registering a custom function with the name in the form specification. If a custom validator depends on other fields of the form, the dependencies must be added to the dependencies list in the field specification. In the example below, the function `validateTestField` depends on the field "testField2".

```json
{
  "name": "testField",
  "type": "text",
  "constraints": {
    "serverSideFunctions": ["validateTestField"]
  },
  "dependencies": ["testField2"]
}
```

### Implementation

Custom validators can be implemented freely as long as they take two arguments. The first argument is the field value and the second argument is an object that contains the values of the field's dependencies. The function should return a `boolean` value that indicates the validity of the field. A custom validator may be a synchronous or an asynchronous function (promise).

```javascript
const customValidator = (fieldValue, dependencies) => {...};
```

## Group fields

The form validator supports groups of fields that may be instantiated multiple times. For instance, this could be used when adding a person's children to a form or when adding the details of many passengers into a reservation form. These subforms are called group fields.

To create a group field, a field must have the type `group`. It must also contain the field definitions of the subfields of the group field. An example of such a field is shown below.

```json
{
  "name": "groupField",
  "type": "group",
  "fields": [
    {
      "name": "subfield1",
      "type": "text"
    },
    {
      "name": "subfield2",
      "type": "number"
    }
  ]
}
```

The normal constraints are supported also in group subfields, i.e. subfields can have the same constraints as normal fields. The group field itself does not currently support constraints on its values.

In terms of form input, a group field value should be structured as an array of objects that contain the values of the group's fields. For instance, the group field above would accept the following JSON:

```json
{
  "groupField": [
    {
      "subfield1": "Test",
      "subfield2": 1
    },
    {
      "subfield1": "Test",
      "subfield2": 2
    }
  ]
}
```
 