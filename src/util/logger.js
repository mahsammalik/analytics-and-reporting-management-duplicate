const winston = require('winston');
const flatten = require('flat');

const loggerFormat = winston.format.printf((info) => {
    let log = info.message;
    log.timestamp = info.timestamp;
    log.level = info.level;
    Object.keys(log).map(key => {
        log[`ms_${key}`] = log[key];
        delete log[key];
    });
    return JSON.stringify(flatten(log));
});

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        loggerFormat,
        winston.format.colorize({ all: process.env.NODE_ENV === 'development' ? true : false, }),
    ),
    transports: [
        // new winston.transports.File(config.winston.file),
        new winston.transports.Console(config.winston.console[process.env.NODE_ENV]),
    ],
    exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;