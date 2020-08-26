import cache from './cache';
import axios from 'axios';
import logger from './logger';
import _ from 'lodash';


const RESPCODE_SERVICE_URL = process.env.MASTER_DATA_API_GET_RESPCODE_URL || config.externalServices.masterDataAPI.responseCodeURL;

class ResponseCodeHandler {
  constructor() {}
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
    console.log(code);
    let responseCodeObj;

    //Default Response message in case no ResponseCode
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

    try {
      //Get Response Code Object From Cache
      let cacheresponseObj = await cache.getValue(code, config.cache.responseCodeCache);
      if (!cacheresponseObj) { //If not found in cache get Response Code from Master Data Microservice
        logger.info("Getting response code from Master Data Microservice");
        const url = RESPCODE_SERVICE_URL;
        let axiosResp = await axios.get(url);
        if (axiosResp && axiosResp.status == 200) {
          let resp = axiosResp.data;
          if (resp && resp.success) {
            let index = _.findIndex(resp.data, function (o) {
              return o.key == code;
            });
            logger.info(" Object found at " + index);
            if (index && index != -1) {
              logger.info(" Printing the object" + resp.data[index]);
              responseCodeObj = resp.data[index];
            } else {
              logger.info(" Unable to get response code from the MongoDB");
            }
          } else {
            logger.info(" Unable to get response code from the MongoDB");
          }
        }
      }
      if (cacheresponseObj) {
        responseCodeObj = JSON.parse(cacheresponseObj);
        response.success = responseCodeObj.success;
        response.responseCode = responseCodeObj.code;
        response.message_en = responseCodeObj.message_en;
        response.message_ur = responseCodeObj.message_ur;
        if (data) {
          response.data = data;
        }
      } else if (responseCodeObj) {

        response.success = responseCodeObj.success;
        response.responseCode = responseCodeObj.code;
        response.message_en = responseCodeObj.message_en;
        response.message_ur = responseCodeObj.message_ur;
      }




      console.log("response" + response);
    } catch (err) {
      logger.error("Error getting response code " + err);
    }

    return response;
  }
}
export default new ResponseCodeHandler();