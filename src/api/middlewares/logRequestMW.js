import uid from 'gen-uid';
import httpContext from 'express-http-context';
import logger from '../../util/logger';

const logRequestMW = (req, res, next) => {

    try {
        const start = new Date();
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
        httpContext.set('requestObj',{msisdn,requestID,originalUrl});         

       logger.log({message:'Incoming Request Headers',level:'info',showDetails:true,msisdn:msisdn,requestID:requestID,URL:originalUrl,headers:requestHeaders}); 
       if(req.body)    
       logger.log({message:'Incoming Request Payload',level:'info',showDetails:true,msisdn:msisdn,requestID:requestID,URL:originalUrl,payload:req.body});  

        //Also apply some logging for response 
        const cleanup = () => {
            res.removeListener('finish', onFinish);
            res.removeListener('close', onClose);
            res.removeListener('error', onError);
        };
    
        const onClose = () => {
            cleanup();
            logger.warn(`Request ${requestID} was aborted by the client sent`);
        };
        const onError = (err) => {
            cleanup();
            logger.error(`Error in request ${requestID}`);
            logger.error(err);
        };
    
        const onFinish = () => {
            cleanup();
            const { statusCode, statusMessage } = res;
            logger.log({showDetails:true, message: 'Outgoing Response Headers', level: 'info', msisdn, responseID: requestID, URL: originalUrl, statusCode, statusMessage, 'contentLength': `(${res.get('Content-Length')} bytes sent)` });
            logger.log({ message: `Outgoing response for request ${requestID} on URL ${originalUrl} took ${new Date() - start} ms `, level: 'info' });
            //logger.info({ responseID: requestID, statusCode, statusMessage, 'contentLength': `(${res.get('Content-Length')} b sent)`, 'at':`(${new Date()})` });
        };
    
        res.on('finish', onFinish);
    
        res.on('close', onClose);
    
        res.on('error', onError);

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