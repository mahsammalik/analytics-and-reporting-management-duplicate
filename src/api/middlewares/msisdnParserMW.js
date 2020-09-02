import { parsePhoneNumber } from 'libphonenumber-js';

/**
 * * keys are name of msisdn in request header and body
 * @param keys {keys.headerKey,keys.bodyKey}
 * @return next() next function in chain
 * 
 */
const msisdnParserMW = (keys) => {
    try {
        return (req, res, next) => {
            if (req.headers && req.headers.hasOwnProperty('X-MSISDN')) {
                req.headers[keys.headerKey] = formatNumber(req.headers['X-MSISDN']);
            }
            if (req.body && keys && keys.bodyKey) {
                req.body = findKey(req.body, keys.bodyKey);
            }
            if (req.query && keys && keys.paramKey) {
                req.query[keys.paramKey] = formatNumber(req.query[keys.paramKey]);
            }
            next();
        };
    } catch (error) {
        logger.error(error);
    }

};

/**
 * * Return number in international E164 format for Pakistan
 * @param {number} msisdn number from header/bodu
 * @return number in international format for Pakistan 
 */
const formatNumber = (number) => {
    return parsePhoneNumber(number.toString(), 'PK').number;
};
/**
 * * Return request body with number in international E164 format
 * @param {object, key} request body, key to be formated
 * @return {object} request body with msisdn in E164 format
 */
const findKey = (object, targetKey) => {
    Object.keys(object).map((key) => {
        if (key === targetKey) {
            object[key] = formatNumber(object[key]);
            return object;
        }
        if (object[key] && typeof object[key] === 'object') {
            let value = findKey(object[key], targetKey);
            return value !== undefined;
        }
    });
    return object;
};

export default msisdnParserMW;