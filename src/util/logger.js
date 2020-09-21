const winston = require('winston');

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} => ${level}: ${message}`;
});

let logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss', 'colorize': true }),
        winston.format.colorize({ all: true }),
        winston.format.prettyPrint(),
        logFormat
    ),
    level: process.env.NODE_ENV === 'dev' ? 'debug' : 'silent',
    transports: [
        // new winston.transports.File(config.winston.file),
        new winston.transports.Console(config.winston.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

module.exports = logger;