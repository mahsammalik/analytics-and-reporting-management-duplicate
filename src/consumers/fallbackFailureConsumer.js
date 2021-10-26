import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processFallbackFailureConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processFallbackFailureConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if(data != undefined || data != null)
            {
                initTransData.msisdn = data.mobile_number;
                initTransData.failureDetail = data.failure_reason;
                initTransData.insertDate = moment(data.insertion_TS).format("YYYY-MM-DD HH:mm:ss");
                initTransData.channel = data?.channel || "consumerApp";
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));

                if (JSON.stringify(initTransData) !== '{}') {
                    if(process.env.NODE_ENV === 'development') {
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.FALLBACK_FAILURE, initTransData);
                    }
                    else {
                        await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.FALLBACK_FAILURE, initTransData);
                    }
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processFallbackFailureConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();