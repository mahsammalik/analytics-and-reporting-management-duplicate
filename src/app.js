import logger from './util/logger';
global.logger = logger;
import express from 'express';
import bodyParser from 'body-parser';
import router from './api/routes/routes';
import compression from 'compression';
// import Cache from './util/cache';
//import Subscriber from './services/subscriberService';
import { requestLoggerMW, schemaValidatorMW } from './api/middlewares';
// import path from 'path';
// const swaggerPath = path.join(__dirname, './definitions/AccountAndTaxStatement.yml');
logger.info('printing webserver value' + config.mongodb.host);

logger.info('Trace message, Winston!');


const app = express();

app.use(compression());
app.use(bodyParser.json());

app.use(schemaValidatorMW);

app.use('/rest/api/v1/reports/statement', router);
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});

module.exports = () =>  app;
