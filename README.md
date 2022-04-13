# Analytics-And-Reporting-Management

# MSISDN Parser Middleware

MSISDN Parser validates and mobile phone number and converts it into 92xxxxxxxxxx format. If correct number is provided it transforms and it moves to next middleware/controller. If the number is invalid it throws and invslid MSISDN error.

## Use

- Copy the file msisdnParserMW.js from 'middlewares'.
- To add MSISDN parser to route import msisdnParserMW to your routes file and add parser as the first middlware in the required routes. Both the object and keys are optional. Keys can contain any number of msisdn keys. Keys should be same as being passed in body/query.
  >     msisdnParserMW({bodyKeys:['msisdn1',...,'msisdnN'],paramKeys:['msisdn1',...,'msisdnN']})

# Swagger Validator

Swagger validator validates the incoming request against the swagger 2.0 specification. It throws errors if any of the required fields are missing. The validator supports only one swagger file.

## Use

1.  Install following packages from npm.
    >     ajv
    >     lodash
    >     validator
    >     yamljs
1.  Create a new folder in 'src' called 'definitions' and add your swagger 2.0 swagger specification file.
1.  Add 'schemaValidatorMW.js' middlware in 'middlewares' folder.
1.  Change the path of swagger file to your swagger 2.0 specification in 'schemaValidatorMW' middleware.
1.  Add 'schema' folder from to 'util' folder.
1.  Import 'schemaValidatorMW' in app.js
1.  Add 'schemaValidator' as an application middlerware in app.js before calling routes.
    >     app.use(schemaValidator)
