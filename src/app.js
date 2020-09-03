import logger from './util/logger';
global.logger = logger;
import express from 'express';
import bodyParser from 'body-parser';
import router from './api/routes';
import compression from 'compression';
import path from 'path';
import responseTime from 'response-time';
// import Cache from './util/cache';
//import Subscriber from './services/subscriberService';
import { requestLoggerMW } from './api/middlewares';
const openApiValidator = require('express-openapi-validator').OpenApiValidator;
// // const swaggerPath = `${path.dirname(__dirname)}/definitions/AccountAndTaxStatement.yml`;
const swaggerPath = path.join(__dirname, './definitions/AccountAndTaxStatement.yml');
console.log(swaggerPath);
const openApiValidatorOptions = {
    apiSpec: swaggerPath,
    validateRequests: true,
    validateResponses: false,
    // ignorePaths: /.*\/identityQuestions$/
};


logger.info('printing webserver value' + config.mongodb.host);

logger.info('Trace message, Winston!');


const app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(responseTime());

app.use('/rest/api/v1/reports/statement', router);

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});


app.use(requestLoggerMW);

// new openApiValidator(openApiValidatorOptions).install(app).then(() => {
//     app.use((err, req, res, next) => {
//         res.status(err.status || 500).json({
//             message: err.message,
//             errors: err.errors,
//         });
//     });
// });

module.exports.app = app;