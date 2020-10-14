import moment from 'moment';
import { logger } from '/util/';

const requestLoggerMW = (req, res) => {
    try {
        logger.info({ event: 'Entered function', functionName: 'requestLoggerMW' });

        const headers = res.getHeaders();

        let action = req._parsedUrl.pathname.split('/');
        action = `${action[action.length - 2]}/${action[action.length - 1]}`;

        const timestamp = moment().format();
        const log = JSON.stringify({
            msisdn: req.headers['X-MSISDN'.toLowerCase()],
            request_method: req.method,
            url: req.url,
            IP: req.headers['X-IP-ADDRESS'.toLowerCase()],
            request_id: `${req.headers['X-MSISDN'.toLowerCase()]}-${timestamp}-${action}`,
            response_time: headers['x-response-time'],
            response: res.locals.response
        });
        logger.info(log);
    } catch (error) {
        logger.error({ event: 'Error thrown ', functionName: 'requestLoggerMW', error, });
        logger.info({ event: 'Exited function', functionName: 'requestLoggerMW' });

        throw new Error(error);
    }
};

export default requestLoggerMW;