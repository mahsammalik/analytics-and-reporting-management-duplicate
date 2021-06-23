import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processWalletRequestConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processWalletRequestConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if(data != undefined || data != null)
            {
                initTransData.msisdn = Number(data.mobile_number);
                initTransData.cnic = data.cnic;
                initTransData.name = data.name;
                initTransData.crm_status = data.crm_status;
                initTransData.request_submission_date = moment(data.request_submission_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD');
                initTransData.request_processing_date = moment(data.request_processing_date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD');
                initTransData.processed_by = data.processed_by;
                initTransData.status = data.failure_reason == "" ? "Success" : data.failure_reason.substr(0,15);
                initTransData.channel = data?.channel || "consumerApp";
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));

                if (JSON.stringify(initTransData) !== '{}') {
                    if(process.env.NODE_ENV === 'development') {
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.WALLET_REQUEST, initTransData);
                    }
                    else {
                        await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.WALLET_REQUEST, initTransData);
                    }
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processWalletRequestConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();