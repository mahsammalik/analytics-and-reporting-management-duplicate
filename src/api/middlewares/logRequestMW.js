import uid from 'gen-uid';
import httpContext from 'express-http-context';
import logger from '../../util/logger';

const logRequestMW = (req, res, next) => {

    try {
        const requestID = req.headers['x-requestid'] || `${uid.token(true)}T${Date.now()}`;
        const msisdn = req.get('X-MSISDN') || 'N/A';
        const { method, originalUrl } = req;
        const urlArray = originalUrl.split('/');
        const usecase = urlArray[urlArray.indexOf('api') + 2];
        const deviceID = req.get('x-device-id') || 'N/A';
        const requestHeaders = {...req.headers };

        httpContext.set('logObj', { requestID, msisdn, deviceID, method, originalUrl, usecase });
        httpContext.set('reqHeaders', req.headers);

        if (requestHeaders['x-mpin']) {
            requestHeaders['x-mpin'] = '****';
        }
       
       httpContext.set('requestObj',{msisdn,requestID,URL});         

       logger.log({message:'Incoming Request Headers',level:'info',msisdn:msisdn,requestID:requestID,URL:originalUrl,headers:requestHeaders}); 
       if(req.body)    
       logger.log({message:'Incoming Request Payload',level:'info',msisdn:msisdn,requestID:requestID,URL:originalUrl,payload:req.body});  

        //logger.debug(requestHeaders);

        next();
    } catch (error) {
        logger.error(error);
        res.status(500).send({
            success: false,
            responseCode: config.default.code,
            message_en: config.default.code,
            message_ur: config.default.code,
            data: []
        });
    }

};


export default logRequestMW;