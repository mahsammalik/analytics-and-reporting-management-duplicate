import logger from './util/logger';
global.logger = logger;
import express from 'express';
import bodyParser from 'body-parser';
import routes from './api/routes/routes';
import compression from 'compression';
// import Cache from './util/cache';
//import Subscriber from './services/subscriberService';
import { requestLoggerMW } from './api/middlewares';
const openApiValidator = require('express-openapi-validator').OpenApiValidator;
import path from 'path';
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

// new openApiValidator(openApiValidatorOptions).install(app).then(() => {
//     app.use((err, req, res, next) => {
//         res.status(err.status || 500).json({
//             message: err.message,
//             errors: err.errors,
//         });
//     });
// });


routes(app);

// app.use(requestLoggerMW());

module.exports.app = app;