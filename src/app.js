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
import { requestLoggerMW, schemaValidatorMW } from './api/middlewares';


logger.info('printing webserver value' + config.mongodb.host);

logger.info('Trace message, Winston!');


const app = express();
app.use(compression());
app.use(bodyParser.json());
app.use(responseTime());

app.use(schemaValidatorMW);
app.use('/rest/api/v1/reports/statement', router);

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});


app.use(requestLoggerMW);

module.exports.app = app;