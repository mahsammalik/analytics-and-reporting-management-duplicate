import httpContext from 'express-http-context';
import { createLogger, format, transports } from 'winston';
// import stringify from 'json-stringify-safe';
import stringify from 'fast-safe-stringify';
const { combine, timestamp, label, printf } = format;
const PRODUCTION_LOG_LEVEL = process.env.PRODUCTION_LOG_LEVEL || 'debug';
const MASKING_KEYS = process.env.MASKING_KEYS || "password, pin";
require('winston-daily-rotate-file');
const winston = require('winston');

const customFormat = printf((info) => {
    const logObj = httpContext.get('logObj') || null;
    const infoCopy = Object.assign({},info, logObj);
    let log;
    if (process.env.NODE_ENV === 'development') {
        log = `[${infoCopy.level}] ${infoCopy.timestamp} ${stringify(infoCopy, null, '...')}`;
    } else {
        //if object contains sensitive property ( i.e. key value matches pin, mpin, password, CVV , credit card etc etc , NADRA, CNIC , Mother's name ), **** 
        if (info.showDetails) {
            log = `${stringify(infoCopy)}`;    
        } else {
            log = `[${infoCopy.level}] ${infoCopy.timestamp} ${infoCopy.msisdn} ${infoCopy.requestID} ${stringify(infoCopy.message)}`
        }
        
        log = maskInput(log);
    }
    if (info instanceof Error) {
        log = `[ERROR:] ${info.timestamp} ${infoCopy.msisdn} ${infoCopy.requestID} ${stringify(info.message)} ${stringify(info.stack)}}`
    }
    return log;
});

const maskInput = (strLog) => {
    let sensitiveKeys = MASKING_KEYS ? MASKING_KEYS.split(/[\s,]+/) : [];
    for (let key of sensitiveKeys) {
        let keyToFind = `"${key}":`;
        let regex = new RegExp(`${keyToFind}"[^"]+"`, 'gmi');
        strLog = strLog.replace(regex, `${keyToFind}"*****"`);
    }
    return strLog;
}

const logger = createLogger({
    format: combine(
        //timestamp({ format: timezoned }),
        timestamp({ format: 'DD-MMM-YYYY HH:mm:ss' }),
        customFormat,
    ),
    transports: [
        // new winston.transports.File(config.winston.file),
        new transports.Console({
            level: PRODUCTION_LOG_LEVEL,
            handleExceptions: true,
        }),
        new winston.transports.DailyRotateFile({
			datePattern:'DD-MM-YYYY-HH', //Create new files every hour
			zippedArchive:true, // Zipp previous files to conserve space
			level: 'debug', // Log messages with debug or higher severity ( including info, error etc)
			filename:'%DATE%-00-hours.log', // File name pattern, appends 1, 2, 3 etc to this name
			dirname:'/jazzcash/data/logs', // Store logs in this path
			maxSize:'50m', //  Create new files if size increased than 50 MB (even if hour isn't over)
			maxFiles: '10d', // Delete files older than 10 days
		})
    ],
    exitOnError: false, // do not exit on handled exceptions
});
export default logger;