import { logger } from '/util/';
import { Subscriber } from '/services/';

/**
 * * Log request for audit to mongo via kafka topic
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @return  response from response code
 */

const auditLoggerMW = async(req, res, next) => {
    try {

        const reqObj = { headers: req.headers, method: req.method, url: req.url, body: req.body, query: req.query, msisdn: req.headers['x-msisdn'], timestamp: new Date() };

        logger.info({ event: 'Entered function', functionName: 'auditLoggerMW', reqObj });

        const subscriber = new Subscriber();

        await subscriber.event.produceMessage(reqObj, config.kafkaBroker.init_auditLog);

        logger.info({ event: 'Exited function', functionName: 'auditLoggerMW' });

        next();

    } catch (error) {
        logger.error({ event: 'Error thrown', functionName: 'auditLoggerMW', error: { message: error.message, stack: error.stack } });
        throw new Error(error);
    }

};

export default auditLoggerMW;