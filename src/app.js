import { logger } from '/util/';
// global.logger = logger;
import express from 'express';
import bodyParser from 'body-parser';
import router from './api/routes';
import compression from 'compression';
import responseTime from 'response-time';
// import Cache from './util/cache';
import { requestLoggerMW, schemaValidatorMW, auditLoggerMW } from './api/middlewares';
import { Subscriber } from '/services/';
import httpContext from 'express-http-context';
import axiosInterceptor from './util/axiosUtil';
import logRequestMW from './api/middlewares/logRequestMW';

// logger.info('printing webserver value' + config.mongodb.host);

// logger.info('Trace message, Winston!');
logger.info({ 'microservice': 'Analytics And Reporting' });

logger.debug({ 'event': 'debugging Analytics And Reporting' });
const app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(httpContext.middleware);
app.use(logRequestMW);
axiosInterceptor();
app.use(responseTime());

// app.use(auditLoggerMW);

// app.use(schemaValidatorMW);

const subscriber = new Subscriber();
subscriber.setConsumer();

app.use('/rest/api/v1/reports/statement', router);
// app.use(requestLoggerMW);
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});

module.exports = () => app;