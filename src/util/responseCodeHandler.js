import cache from './cache';
import axios from 'axios';
import logger from './logger';
import _ from 'lodash';


const RESPCODE_SERVICE_URL = process.env.MASTER_DATA_API_GET_RESPCODE_URL || config.externalServices.masterDataAPI.responseCodeURL;

class ResponseCodeHandler {



    async getErrorResponseCode(error)
    {
        let response = {
            success: false,
            responseCode: config.responseCode.default.code,
            message_en: config.responseCode.default.message,
            message_ur: config.responseCode.default.message,
            data: {}
        };
       
        if(process.env.PRODUCTION_LOG_LEVEL=== 'debug')
        {
            response.exception=error.message;
            response.stack=error.stack;
        }
        //logger.info("Outgoing Response " + JSON.stringify(response));
        return response;
    }


    async getThirdPartyResponseCode(code, error) {
        //logger.debug(code);
        let responseCodeObj;

        //Default Response message in case no ResponseCode
        let response = {
            success: false,
            responseCode: config.responseCode.default.code,
            message_en: config.responseCode.default.message,
            message_ur: config.responseCode.default.message,
            data: {},
            
        };
        if(process.env.PRODUCTION_LOG_LEVEL=== 'debug')
        {
            response.thirdPartyResponse = error;
        }

        if (!code || _.isEmpty(code)) {
        //logger.info("Outgoing Response " + JSON.stringify(response));
        return response;
        }

        try {
            //Get Response Code Object From Cache
            let cacheresponseObj = await cache.getValue(code, config.cache.responseCodeCache);
            if (!cacheresponseObj) { //If not found in cache get Response Code from Master Data Microservice
                logger.debug("Getting response code from Master Data Microservice");
                const url = RESPCODE_SERVICE_URL;
                // axios.interceptors.response.use(res => {
                //     logger.debug('response from masterdata');
                //     // logger.info(JSON.stringify(res.data));
                //     // Important: request interceptors **must** return the request.
                //     return res;
                // });
                let axiosResp = await axios.get(url);
                if (axiosResp && axiosResp.status == 200) {
                    let resp = axiosResp.data;
                    if (resp && resp.success) {
                        let index = _.findIndex(resp.data, function(o) {
                            return o.key == code;
                        });
                        logger.debug(" Object found at " + index);
                        if (index && index != -1) {
                            logger.debug(" Printing the object" + resp.data[index]);
                            responseCodeObj = resp.data[index];
                        } else {
                            logger.debug(" Unable to get response code from the MongoDB");
                        }
                    } else {
                        logger.debug(" Unable to get response code from the MongoDB");
                    }
                }
            }
            if (cacheresponseObj) {
                responseCodeObj = cacheresponseObj;
                response.success = responseCodeObj.success;
                response.responseCode = responseCodeObj.code;
                response.message_en = responseCodeObj.message_en;
                response.message_ur = responseCodeObj.message_ur;
               
            } else if (responseCodeObj) {

                response.success = responseCodeObj.success;
                response.responseCode = responseCodeObj.code;
                response.message_en = responseCodeObj.message_en;
                response.message_ur = responseCodeObj.message_ur;
               
            }

            logger.debug("response" + response);
        } catch (err) {
            throw new Error(' Error getting the response code '+err);
            //logger.error("Error getting response code " + err);
        }
    
        logger.info("Outgoing Response " + JSON.stringify(response));
        return response;
    }

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
            logger.debug({ event: 'Entered function', functionName: 'getResponseCode in class responseCodeHandler' });
            let responseCodeObj;
            let response = {
                success: false,
                responseCode: config.responseCode.default.code,
                message_en: config.responseCode.default.message,
                message_ur: config.responseCode.default.message,
                data: {}
            };
            logger.debug(response, " cacheresponseObj getResponseCode", code)

            if (!code || _.isEmpty(code)) {
                return response;
            }
            logger.debug(" cacheresponseObj BEFORE getResponseCode", config.cache.responseCodeCache)

            //Get Response Code Object From Cache
            let cacheresponseObj = await cache.getValue(code, config.cache.responseCodeCache);
            logger.debug(cacheresponseObj, " cacheresponseObj getResponseCode")
            if (!cacheresponseObj) { //If not found in cache get Response Code from Master Data Microservice
                logger.debug({ event: 'Entered !cacheresponseObj block', functionName: 'getResponseCode in class responseCodeHandler' });
                logger.debug(RESPCODE_SERVICE_URL, "RESPCODE_SERVICE_URL getResponseCode")
                const url = RESPCODE_SERVICE_URL;
                logger.debug(url)
                let axiosResp = await axios.get(url);
                logger.debug(axiosResp, " axiosResp getResponseCode")
                if (axiosResp && axiosResp.status == 200) {
                    let resp = axiosResp.data;
                    if (resp && resp.success) {
                        let index = _.findIndex(resp.data, function (o) {
                            return o.key == code;
                        });
                        logger.debug({ event: " Object found at " + index });
                        if (index && index != -1) {
                            logger.debug({ event: " Printing the object" + resp.data[index] });
                            responseCodeObj = resp.data[index];
                        } else {
                            logger.debug({ event: " Unable to get response code from the MongoDB" });
                        }
                    } else {
                        logger.error({ event: " Unable to get response code from the MongoDB" });
                    }
                }
                logger.debug({ event: 'Exited !cacheresponseObj block', functionName: 'getResponseCode in class responseCodeHandler' });
            }
            if (cacheresponseObj) {
                logger.debug({ event: 'Entered cacheresponseObj block', functionName: 'getResponseCode in class responseCodeHandler' });
                responseCodeObj = cacheresponseObj;
                response.success = responseCodeObj.success;
                response.responseCode = responseCodeObj.code;
                response.message_en = responseCodeObj.message_en;
                response.message_ur = responseCodeObj.message_ur;
                if (data) {
                    response.data = data;
                }
                logger.debug({ event: 'Exited cacheresponseObj block', functionName: 'getResponseCode in class responseCodeHandler' });
            } else if (responseCodeObj) {
                logger.debug({ event: 'Entered responseCodeObj block', functionName: 'getResponseCode in class responseCodeHandler' });
                response.success = responseCodeObj.success;
                response.responseCode = responseCodeObj.code;
                response.message_en = responseCodeObj.message_en;
                response.message_ur = responseCodeObj.message_ur;
                if (data) {
                    response.data = data;
                }
                logger.debug({ event: 'Exited responseCodeObj block', functionName: 'getResponseCode in class responseCodeHandler' });
            }
            logger.info("Outgoing Response " + JSON.stringify(response));
            return response;
        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'getResponseCode in class responseCodeHandler', error, code, data });
            

            throw new Error(error);

        }


    }
}
export default new ResponseCodeHandler();