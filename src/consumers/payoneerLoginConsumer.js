import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processPayoneerLoginConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processPayoneerLoginConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            initTransData.msisdn = data?.msisdn || '0';
            initTransData.payEmail = data?.account_details?.contact?.email || '';
            initTransData.email = data?.account_details?.jazzEmail || '';
            initTransData.activityDate = moment(data?.data?.consented_on).format('YYYY-MM-DD HH:mm:ss');
            initTransData.channel = data?.channel || 'consumerApp';
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if (process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.PAYON_LOGIN, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.PAYON_LOGIN, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processPayoneerLoginConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();