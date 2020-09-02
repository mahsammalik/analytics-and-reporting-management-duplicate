import moment from 'moment';
import responseTime from 'response-time';
const requestLoggerMW = () => {
    return (req, res, time) => {
        try {
            const loggingTime = responseTime(req, res, time);
            // const log = `Response Time:${loggingTime}`;
            // logger.info();
            console.log(`loggingTime ${loggingTime}`);
        } catch (error) {
            console.log(error);
            logger.error(error);
        }
    };
};

export default requestLoggerMW;