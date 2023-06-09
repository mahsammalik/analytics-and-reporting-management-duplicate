import { Pool } from "ibm_db";
import logger from './logger';
const conStr = config.DB2_Jazz.connectionString
const maxPoolSize = Number(process.env.DB2ConnMaxPoolSize) || config.DB2_Jazz.maxPoolSize

let instance = null;

class DB2ConnectionPool
{
    constructor()
    {
        this.pool = new Pool({maxPoolSize: maxPoolSize});
    }

    static getInstance() {
        if(!instance) {
            instance = new DB2ConnectionPool();
        }
        return instance;
    }
}

export default DB2ConnectionPool;