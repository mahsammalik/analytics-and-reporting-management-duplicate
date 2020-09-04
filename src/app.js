import logger from './util/logger';
global.logger = logger;
import express from 'express';
import bodyParser from 'body-parser';
import router from './api/routes/routes';
import compression from 'compression';
// import Cache from './util/cache';
//import Subscriber from './services/subscriberService';
import { requestLoggerMW } from './api/middlewares';
import path from 'path';
const swaggerPath = path.join(__dirname, './definitions/AccountAndTaxStatement.yml');
logger.info('printing webserver value' + config.mongodb.host);

logger.info('Trace message, Winston!');
console.log(swaggerPath);


const createMiddleware = require('@apidevtools/swagger-express-middleware');

const app = express();

app.use(compression());
app.use(bodyParser.json());


createMiddleware(swaggerPath, app, function(err, middleware) {
    // Add all the Swagger Express Middleware, or just the ones you need.
    // NOTE: Some of these accept optional options (omitted here for brevity)

    app.use(
        middleware.metadata(),
        middleware.CORS(),
        middleware.files(),
        middleware.parseRequest(),
        middleware.validateRequest()
    );


    app.use('/rest/api/v1/reports/statement', router);
    app.use((err, req, res, next) => {
        console.log(err.toString());
        res.status(err.status || 500).json({
            message: err.message,
            errors: err.errors,
        });
    });

});

module.exports.app = app;