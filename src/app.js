import logger from './util/logger';
global.logger = logger;
import express from 'express';
import bodyParser from 'body-parser';
import router from './api/routes/routes';
import compression from 'compression';
// import Cache from './util/cache';
//import Subscriber from './services/subscriberService';
import { requestLoggerMW } from './api/middlewares';
const { OpenApiValidator } = require('express-openapi-validator');
import path from 'path';

const swaggerPath = path.join(__dirname, './definitions/AccountAndTaxStatement.yml');

const openApiValidatorOptions = {
    apiSpec: swaggerPath,
    validateRequests: true,
    validateResponses: false,
    additionalProperties: false,
    operationHandlers: true
        // ignorePaths: /.*\/identityQuestions$/
};
logger.info('printing webserver value' + config.mongodb.host);

logger.info('Trace message, Winston!');


const app = express();
app.use(compression());
app.use(bodyParser.json());

new OpenApiValidator(openApiValidatorOptions).install(app).then(() => {

    app.use('/rest/api/v1/reports/statement', router);

    //Error Handler
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        });
    });
});

// app.use(requestLoggerMW());

module.exports.app = app;