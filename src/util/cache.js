import infinispan from 'infinispan';
import logger from './logger';

const CACHE_SERVER = process.env.CACHE_SERVER || config.cache.server;
const CACHE_PORT = process.env.CACHE_PORT || config.cache.port;
const CACHE_SERVER2 = process.env.CACHE_SERVER2;
const CACHE_SERVER_PORT2 = process.env.CACHE_PORT2;
const CACHE_SERVER3 = process.env.CACHE_SERVER1;
const CACHE_SERVER_PORT3 = process.env.CACHE_PORT3;


class Cache {
    constructor() {
        //this.pool = {}
    }

    async _getCacheInstance(cacheName) {
        logger.info(`Trying to connect to Cache ${cacheName}`)
        /* Removing cache pool temporarily */
        /* if (this.pool.cacheName) {
            return this.pool.cacheName
        } */
        let client;

        //TODO: implement it across all ms
        try {
            
            client = await infinispan.client({
                port: CACHE_PORT,
                host: CACHE_SERVER
            }, {
                cacheName: cacheName,
                dataFormat: {
                    keyType: 'text/plain',
                    valueType: 'application/json'
                }
            });
            logger.info(`Connected to Infinispan Cache ` + cacheName);
            
        } catch (e) {
            logger.error(`Couldn't connected to Cache ${cacheName}`)
            logger.error(e);
        }
        // if (client) {
        //     logger.info(`Connected to Infinispan Cache ` + cacheName);
        // }
        /* this.pool.cacheName = client; */
        return client;
    }

    async putValue(key, value, cacheName) {
        let client;
        try {
            client = await this._getCacheInstance(cacheName);
            await client.put(key, value);
            let stats = await client.stats();
            logger.info('Number of stores: ' + stats.stores);
            logger.info('Number of cache hits: ' + stats.hits);
            logger.info('All stats: ' + JSON.stringify(stats, null, ' '));
            logger.info('Value saved in Datacache');
           await client.disconnect();
        } catch (e) {
            logger.info('Unable to put value in cache' + e);
            if (client) {
               await client.disconnect();
                //delete this.pool.cacheName;
            }
        }
    }

    async getValue(key, cacheName) {
        let client;
        try {
            client = await this._getCacheInstance(cacheName);
            let value = await client.get(key);
            logger.info('printing value for key ' + key + ' is ' + value);
           await client.disconnect();
            return value;
        } catch (e) {
            logger.info('Unable to get value from cache' + e);
            if (client) {
               await client.disconnect();
                //delete this.pool.cacheName;
            }
        }
    }



    /**
     * 
     * @param {list} data 
     *  Example
     *   var data = [
     *          {key: 'multi1', value: 'v1'},
     *          {key: 'multi2', value: 'v2'},
     *          {key: 'multi3', value: 'v3'}];
     * @param {string} cacheName  
     */
    async putAll(data, cacheName) {
        let client;
        try {
            client = await this._getCacheInstance(cacheName);
            await client.putAll(data);
            let stats = await client.stats();
            logger.info('Number of stores: ' + stats.stores);
            logger.info('Number of cache hits: ' + stats.hits);
            logger.info('All stats: ' + JSON.stringify(stats, null, ' '));
            logger.info('Values saved in Datacache');
           await client.disconnect();
        } catch (e) {
            logger.info('Unable to put All values in cache' + e);
            if (client) {
               await client.disconnect();
                //delete this.pool.cacheName;
            }
        }
    }



    /**
     * 
     * @param {Array} keys 
     * ['multi2', 'multi3']
     * @param {String} cacheName 
     */
    async getAll(keys, cacheName) {
        let client;
        try {
            client = await this._getCacheInstance(cacheName);
            let data = await client.getAll(keys);
            let stats = await client.stats();
            logger.info('Number of stores: ' + stats.stores);
            logger.info('Number of cache hits: ' + stats.hits);
            logger.info('All stats: ' + JSON.stringify(stats, null, ' '));
            if (data)
                logger.info('Values get from Datacache' + JSON.stringify(data));
           await client.disconnect();
            return data;
        } catch (e) {
            logger.info('Unable to get All values from cache' + e);
            if (client) {
               await client.disconnect();
                //delete this.pool.cacheName;
            }
        }
    }


    async putValueWithExpiry(key, value, cacheName, expiration) {
        let client;
        try {
            client = await this._getCacheInstance(cacheName);
            
            if (client == undefined || client == null) {
                logger.error(`Unable to get ${cacheName} cache client`);
                return false;
            }

            await client.put(key, value, {lifespan: expiration});
            logger.info(`Value inserted against key: ${key} for expiry: ${expiration}`);

            // let stats = await client.stats();
            // logger.info('Number of stores: ' + stats.stores);
            // logger.info('Number of cache hits: ' + stats.hits);
            // logger.info('All stats: ' + JSON.stringify(stats, null, ' '));
            // logger.info('Value saved in Datacache');
           await client.disconnect();
            return true;
        } catch (e) {
            logger.info('Unable to put value with expiry in cache' + e);
            if (client) {
               await client.disconnect();
                //delete this.pool.cacheName;
            }
            return false;
        }
    }

    async replaceValue(key, value, cacheName, expiration) {
        let client;

        logger.info(`Connected to Infinispan dashboard data`);
        try {
            client = await this._getCacheInstance(cacheName);
            let success = await client.replace(key, value, expiration);
            console.log(success);
           await client.disconnect();
            return success;

        } catch (e) {
            logger.info('Unable to get value from cache' + e);
            if (client) {
               await client.disconnect();
                //delete this.pool.cacheName;
            }
        }
    }

}

export default new Cache();