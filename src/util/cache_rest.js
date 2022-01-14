import logger from './logger';
import axios from 'axios';
import Agent from 'agentkeepalive';




const CACHE_URL = process.env.CACHE_URL || config.cache.url; // Live: http://datagrid.datagrid-prod:11222/rest/v2/caches
const CACHE_AUTH_HEADER = process.env.CACHE_AUTH_HEADER || 'Basic YWRtaW46cGFzcw==';
const ENABLE_CACHE_AUTH = process.env.ENABLE_CACHE_AUTH || 'false'; // for local dev, set this to true in .env file

const keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

class CacheRest {

    constructor() {
      let headers = {};
      if (ENABLE_CACHE_AUTH == 'true') {
        headers = {
          'Authorization': CACHE_AUTH_HEADER
        }
      }
      this.axiosRequest = axios.create({
        httpAgent: keepaliveAgent,
        httpsAgent: keepaliveAgent,
        baseURL: CACHE_URL,
        headers
      });
    }

    async putValue(key, value, cacheName) {
      try {
        const url = `${cacheName}/${key}`;
        await this.axiosRequest.put(url, value);
        return true;
      } catch (error) {
        if (error.response) {
          /*
           * The request was made and the server responded with a
           * status code that falls out of the range of 2xx
           */
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
      } else if (error.request) {
          /*
           * The request was made but no response was received, `error.request`
           * is an instance of XMLHttpRequest in the browser and an instance
           * of http.ClientRequest in Node.js
           */
          console.log(error.request);
      } else {
          // Something happened in setting up the request and triggered an Error
          console.log('Error', error.message);
      }
        
        return false;
      }
    }

    async putValueWithExpiry(key, value, cacheName, expiry) {
      try {
        const url = `${cacheName}/${key}`;
        await this.axiosRequest.put(url, value, {headers: {timeToLiveSeconds: expiry}});
        return true;
      } catch (error) {
        if (error.response) {
          /*
          * The request was made and the server responded with a
          * status code that falls out of the range of 2xx
          */
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
      } else if (error.request) {
          /*
          * The request was made but no response was received, `error.request`
          * is an instance of XMLHttpRequest in the browser and an instance
          * of http.ClientRequest in Node.js
          */
          console.log(error.request);
      } else {
          // Something happened in setting up the request and triggered an Error
          console.error(error.message);
      }        
        logger.error('Unable to put value in cache');
        
        return false;
      }
    }

    async getValue(key, cacheName) {
      const url = `${cacheName}/${key}`;
      try {
        
        const rsp = await this.axiosRequest.get(url);
        return rsp.data;
      } catch (error) {
        logger.error('Unable to get value from cache'+ url);
        if (error.response) {
          /*
           * The request was made and the server responded with a
           * status code that falls out of the range of 2xx
           */
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
      } else if (error.request) {
          /*
           * The request was made but no response was received, `error.request`
           * is an instance of XMLHttpRequest in the browser and an instance
           * of http.ClientRequest in Node.js
           */
          console.log(error.request);
      } else {
          // Something happened in setting up the request and triggered an Error
          console.log('Error', error.message);
      }
        return null;
      }
    }

    async deleteValue(key, cacheName) {
      try {
        const url = `${cacheName}/${key}`;
        await this.axiosRequest.delete(url);
        return true;
      } catch (error) {
        logger.error('Unable to delete value in cache');
        if (error.response) {
          /*
           * The request was made and the server responded with a
           * status code that falls out of the range of 2xx
           */
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          /*
           * The request was made but no response was received, `error.request`
           * is an instance of XMLHttpRequest in the browser and an instance
           * of http.ClientRequest in Node.js
           */
          console.log(error.request);
        } else {
          // Something happened in setting up the request and triggered an Error
          console.log('Error', error.message);
      }
        return false;
      }
    }
    

}

export default new CacheRest();
