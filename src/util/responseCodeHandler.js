import cache from './cache';
import axios from 'axios';
import logger from './logger';
import _ from 'lodash';


const RESPCODE_SERVICE_URL = process.env.MASTER_DATA_API_GET_RESPCODE_URL || config.externalServices.masterDataAPI.responseCodeURL;

class ResponseCodeHandler {

    /**
     * 
     * 
     * @param {String} code
     * Required
     * Usecase Error/Success Code
     * @param {Array} data 
     * Data that needs to be part of response
     */

    async getResponseCode(code, data) {

        try {
            logger.info({ event: 'Entered function', functionName: 'getResponseCode in class responseCodeHandler' });
            let responseCodeObj;
            let response = {
                success: false,
                responseCode: config.responseCode.default.code,
                message_en: config.responseCode.default.message,
                message_ur: config.responseCode.default.message,
                data: {}
            };
            if (!code || _.isEmpty(code)) {
                return response;
            }
            //Get Response Code Object From Cache
            let cacheresponseObj = await cache.getValue(code, config.cache.responseCodeCache);
            if (!cacheresponseObj) { //If not found in cache get Response Code from Master Data Microservice
                logger.info({ event: 'Entered !cacheresponseObj block', functionName: 'getResponseCode in class responseCodeHandler' });
                const url = RESPCODE_SERVICE_URL;
                let axiosResp = await axios.get(url);
                if (axiosResp && axiosResp.status == 200) {
                    let resp = axiosResp.data;
                    if (resp && resp.success) {
                        let index = _.findIndex(resp.data, function(o) {
                            return o.key == code;
                        });
                        logger.info({ event: " Object found at " + index });
                        if (index && index != -1) {
                            logger.info({ event: " Printing the object" + resp.data[index] });
                            responseCodeObj = resp.data[index];
                        } else {
                            logger.info({ event: " Unable to get response code from the MongoDB" });
                        }
                    } else {
                        logger.error({ event: " Unable to get response code from the MongoDB" });
                    }
                }
                logger.info({ event: 'Exited !cacheresponseObj block', functionName: 'getResponseCode in class responseCodeHandler' });
            }
            if (cacheresponseObj) {
                logger.info({ event: 'Entered cacheresponseObj block', functionName: 'getResponseCode in class responseCodeHandler' });
                responseCodeObj = JSON.parse(cacheresponseObj);
                response.success = responseCodeObj.success;
                response.responseCode = responseCodeObj.code;
                response.message_en = responseCodeObj.message_en;
                response.message_ur = responseCodeObj.message_ur;
                if (data) {
                    response.data = data;
                }
                logger.info({ event: 'Exited cacheresponseObj block', functionName: 'getResponseCode in class responseCodeHandler' });
            } else if (responseCodeObj) {
                logger.info({ event: 'Entered responseCodeObj block', functionName: 'getResponseCode in class responseCodeHandler' });
                response.success = responseCodeObj.success;
                response.responseCode = responseCodeObj.code;
                response.message_en = responseCodeObj.message_en;
                response.message_ur = responseCodeObj.message_ur;
                logger.info({ event: 'Exited responseCodeObj block', functionName: 'getResponseCode in class responseCodeHandler' });
            }
            logger.info({ event: 'Exited function', functionName: 'getResponseCode in class responseCodeHandler' });
            return response;
        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'getResponseCode in class responseCodeHandler', error, code, data });
            logger.info({ event: 'Exited function', functionName: 'getResponseCode in class responseCodeHandler' });

            throw new Error(error);

        }


    }
}
export default new ResponseCodeHandler();