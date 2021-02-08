import axios from 'axios';
import httpContext from 'express-http-context';
const LOCAL_PORT_NUMBER = process.env.LOCAL_PORT_NUMBER || 3000;

const axiosInterceptor = () => {
    axios.interceptors.request.use(req => {
        logger.info({ url: req.url, method: req.method });
        const logObj = httpContext.get('logObj') || null;
        const localPort = Number(LOCAL_PORT_NUMBER);
        if (logObj && logObj.requestID && req.url.indexOf(localPort) !== -1) {
            req.headers['x-requestid'] = logObj.requestID;
        }
        return req;
    });
};


export default axiosInterceptor;