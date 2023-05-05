import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = config.DB2_Jazz.schema;

class Processor {

    constructor() { }

    async processInsuranceClaimConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processInsuranceClaimConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            initTransData.date = moment(data.date).format('YYYY-MM-DD HH:mm:ss');
            initTransData.msisdn = data?.msisdn || '0';
            initTransData.title = data?.title || '';
            initTransData.description = data?.description || '';
            initTransData.channel = data?.channel || '';
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.INSURANCE_CLAIM, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.INSURANCE_CLAIM, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processInsuranceClaimConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();