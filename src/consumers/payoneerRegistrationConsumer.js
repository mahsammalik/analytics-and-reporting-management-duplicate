import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processPayoneerRegConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processPayoneerRegConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            initTransData.msisdn = Number(data?.msisdn || '0');
            initTransData.payUsername = (data?.account_details?.contact?.first_name || '') + " " + (data?.account_details?.contact?.last_name || '');
            initTransData.email = data?.account_details?.contact?.email || '';
            initTransData.country = data?.account_details?.address?.country || '';
            initTransData.city = data?.account_details?.address?.city || '';
            initTransData.zip_code = data?.account_details?.address?.zip_code || '';
            initTransData.address = (data?.account_details?.address?.address_line_1 || '') + " " + (data?.account_details?.address?.address_line_2 || '');
            initTransData.status_text = data?.is_active == true ? "ACTIVE" : "IN-ACTIVE";
              initTransData.activityDate = data?.createdAt || null;
            if(initTransData.activityDate != null) {
                initTransData.activityDate = moment(initTransData.activityDate).format('YYYY-MM-DD HH:mm:ss');
            }
            initTransData.channel = data?.channel || 'consumerApp';
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if (process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.PAYON_REG_LINK, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.PAYON_REG_LINK, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processPayoneerRegConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();