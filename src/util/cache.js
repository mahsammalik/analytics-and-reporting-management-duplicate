import infinispan from 'infinispan';
import { logger } from '/util/';
const CACHE_SERVER = process.env.CACHE_SERVER || config.cache.server;
const CACHE_SERVER_PORT = config.cache.port;


class Cache {
    constructor() { 
        this.pool = {}
    }

    async _getCacheInstance(cacheName) {
        try {
            logger.debug(cacheName, "_getCacheInstance cacheName", CACHE_SERVER_PORT, CACHE_SERVER)
            if (this.pool.cacheName) {
                logger.debug(`Found an existing cache pool for ${cacheName}`)
                return this.pool.cacheName
            }
            logger.debug(`Did not find an existing cache pool for ${cacheName} , try to set new connection wish me luck `)
            const client = await infinispan.client({
                port: CACHE_SERVER_PORT,
                host: CACHE_SERVER,
            }, {
                cacheName: cacheName,
                dataFormat: {
                    keyType: 'text/plain',
                    valueType: 'application/json'
                }
            });
            if (client) logger.info({ event: `Connected to Infinispan DataCache ` + cacheName });
            
            this.pool.cacheName = client;
            return client;
        }
        catch (err) {
            logger.debug(err, "_getCacheInstance error")
        }
    }

    async putValue(key, value, cacheName) {
        let client;
        try {
            client = await this._getCacheInstance(cacheName);
            await client.put(key, value);
            let stats = await client.stats();
            logger.info({ event: 'Number of stores: ' + stats.stores });
            logger.info({ event: 'Number of cache hits: ' + stats.hits });
            logger.info({ event: 'All stats: ' + JSON.stringify(stats, null, ' ') });
            logger.info({ event: 'Value saved in Datacache' });
            //await client.disconnect();
        } catch (e) {
            logger.info({ event: 'Error Thrown', message: 'Unable to put value in cache' + e });
            if (client) {
                //await client.disconnect();
            }
        }
    }

    async getValue(key, cacheName) {
        let client;
        try {
            logger.debug(cacheName, " cacheName getValue")
            client = await this._getCacheInstance(cacheName);
            logger.debug(client, "client getValue")
            let value = await client.get(key);
            logger.debug(value, "value getValue")
            logger.info({ event: 'printing value for key ' + key + ' is ' + value });
            //await client.disconnect();
            return value;
        } catch (e) {
            logger.info({ event: 'Unable to get value from cache' + e });
            if (client) {
                //await client.disconnect();
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
            //await client.disconnect();
        } catch (e) {
            logger.info('Unable to put All values in cache' + e);
            if (client) {
                //await client.disconnect();
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
            //await client.disconnect();
            return data;
        } catch (e) {
            logger.info('Unable to get All values from cache' + e);
            if (client) {
                //await client.disconnect();
            }
        }
    }


}

const _Cache = new Cache();

export default _Cache;