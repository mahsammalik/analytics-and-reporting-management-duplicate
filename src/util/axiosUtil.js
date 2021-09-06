import axios from 'axios';
import httpContext from 'express-http-context';
const LOCAL_PORT_NUMBER = process.env.LOCAL_PORT_NUMBER || 3000;
import logger from './logger';
import _ from 'lodash';

const axiosInterceptor = () => {
    axios.interceptors.request.use(req => {
        
      const logObj = httpContext.get('logObj') || null;
      const requestObj = httpContext.get('requestObj') || null;
      
      let reqDataCopy = _.cloneDeep(req.data);
      if (reqDataCopy && reqDataCopy.attachments) { // This is done to avoid lenghty base 64 encoded values of emails attachments to be printed while making calls to the Notification service for emails
        delete reqDataCopy.attachments;
      }

        //logger.log({level:'info',msisdn:requestObj.msisdn,requestID:requestObj.requestID,URL:requestObj.originalUrl,headers:req.}); 
        if(requestObj){
          logger.log({message:"Third Party Request ",level:'info',showDetails:true, msisdn:requestObj.msisdn,requestID:requestObj.requestID,URL:requestObj.originalUrl,axiosURL:req.url,axiosMethod:req.method,axiosRequestData:reqDataCopy}); 
        }
        //logger.debug({ url: req.url, method: req.method });
        const localPort = Number(LOCAL_PORT_NUMBER);
        if (logObj && logObj.requestID && req.url.indexOf(localPort) !== -1) {
            req.headers['x-requestid'] = logObj.requestID;
        }
        return req;
    });

    axios.interceptors.response.use((response) => {
        // do something with the response data
        
        //const logObj = httpContext.get('logObj') || null;
        const requestObj=httpContext.get('requestObj') || null;

        //logger.log({level:'info',msisdn:requestObj.msisdn,requestID:requestObj.requestID,URL:requestObj.originalUrl,headers:req.}); 
        if (requestObj) {
        logger.log({message:"Third Party Response ",level:'info',showDetails:true, msisdn:requestObj.msisdn,requestID:requestObj.requestID,URL:requestObj.originalUrl,axiosURL:response.url,axiosResponseData:response.data}); 
        }
        return response;
      }, error => {
        const requestObj = httpContext.get('requestObj') || null;
        if (requestObj) {
          logger.log({message:"Third Party Response ",level:'info',showDetails:true,msisdn:requestObj.msisdn,requestID:requestObj.requestID,URL:requestObj.originalUrl,axiosURL:error.response?.config?.url,axiosResponseData:error.response?.data});
        }
        // handle the response error
        return Promise.reject(error);
      });

};


export default axiosInterceptor;