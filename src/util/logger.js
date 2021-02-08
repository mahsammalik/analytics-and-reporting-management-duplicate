import httpContext from 'express-http-context';
import { createLogger, format, transports } from 'winston';
import stringify from 'json-stringify-safe';
const { combine, timestamp, label, printf } = format;
const PRODUCTION_LOG_LEVEL = process.env.PRODUCTION_LOG_LEVEL || 'debug';
const customFormat = printf((info) => {
    const logObj = httpContext.get('logObj') || null;
    info = Object.assign(info, logObj);
    let log;
    if (process.env.NODE_ENV === 'development') {
        log = `[${info.label}] ${info.timestamp} ${stringify(info, null, '...')}`;
    } else {
        log = `[${info.label}] ${info.timestamp} ${stringify(info)}`;
    }
    return log;
});
const logger = createLogger({
    format: combine(
        label({ label: 'Analytics&Reporting_MS' }),
        timestamp({ format: 'DD-MMM-YYYY HH:mm:ss' }),
        customFormat,
    ),
    transports: [
        // new winston.transports.File(config.winston.file),
        new transports.Console({
            level: PRODUCTION_LOG_LEVEL,
            handleExceptions: true,
        }),
    ],
    exitOnError: false, // do not exit on handled exceptions
});
export default logger;