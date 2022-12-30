import { logger } from '/util/';
global.logger = logger;
import express from 'express';
import bodyParser from 'body-parser';
import router from './api/routes';
import compression from 'compression';
import responseTime from 'response-time';
// import Cache from './util/cache';
import { requestLoggerMW, schemaValidatorMW, auditLoggerMW } from './api/middlewares';
import { Subscriber, RewardSubscriber} from '/services/';
import httpContext from 'express-http-context';
import axiosInterceptor from './util/axiosUtil';
import logRequestMW from './api/middlewares/logRequestMW';
import DB2Connection from './util/DB2Connection';
import { open } from 'ibm_db';

// logger.info('printing webserver value' + config.mongodb.host);

// logger.info('Trace message, Winston!');
logger.info({ 'microservice': 'Analytics And Reporting' });

logger.debug({ 'event': 'debugging Analytics And Reporting' });
const app = express();

app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));
app.use(httpContext.middleware);
app.use(logRequestMW);
axiosInterceptor();
app.use(responseTime());


// app.use(auditLoggerMW);

// app.use(schemaValidatorMW);

if(process.env.CONSUMER && process.env.CONSUMER.toLowerCase() === "true"){    
    logger.info({
      event: 'kafka subscriber true conditon',
      data: process.env.IS_SUBCRIBER
    });
    const subscriber = new Subscriber();
    subscriber.setConsumer();
    const rewardSubscriber = new RewardSubscriber();
    rewardSubscriber.setConsumer();  
  }

app.use('/rest/api/v1/reports/statement', router);
// app.use(requestLoggerMW);
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});

app.get('/test_db', async (req, res) => {
    let msisdn = req.headers['x-msisdn'];
    let end_date = req.query.end_date;
    const connectionString = config.DB2_Jazz.connectionString;
    let conn=null;
    try{
    conn = await open(connectionString);

    logger.info("Calling DB2 getLatestAccountBalanceValue function ", msisdn, end_date);
    let balance = await DB2Connection.getLatestAccountBalanceValueWithConn(msisdn, end_date,conn);
    logger.info("Returned latest balance: ", balance);

    res.status(200).send();
    }
    catch(e)
    {
        logger.error('Exception '+e);
    }
    finally{
        logger.info('Executing Finally ');
        conn.close(function (err) { if (err) { logger.error(err) } });
    }
    
});

module.exports = () => app;
