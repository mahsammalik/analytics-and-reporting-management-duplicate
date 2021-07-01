import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processPayoneerTransConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processPayoneerTransConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            initTransData.msisdn = Number(data?.msisdn || '0');
            initTransData.payUsername = data?.payoneerEmail || data?.account_details?.contact?.email || '';
            initTransData.pkrAmount = Number(data?.amountInPKR || '0');
            initTransData.usdAmount = Number(data?.transferAmount || '0');
            initTransData.exchangeRate = Number(data?.exchangeRate || '0');
            initTransData.currency = data?.currency || '';
            initTransData.description = data?.txMonetaStatusDesc || '';
            initTransData.activityDate = data?.updatedAt || null;
            if(initTransData.activityDate != null) {
                initTransData.activityDate = initTransData.activityDate.replace('T', ' ').replace('Z', '');
                initTransData.activityDate = initTransData.activityDate.includes('.') ? initTransData.activityDate.split('.')[0] : initTransData.activityDate;
            }
            initTransData.monetaStatus = data?.txMonetaExpressResponseDesc || '';
            initTransData.channel = data?.channel || 'consumerApp';
            initTransData.TID = Number(data?.txID || '0');
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.infor("printing payload in processPayoneerTransConsumer: " + JSON.stringify(initTransData));
            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if (process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.PAYON_TRANSACTIONS, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.PAYON_TRANSACTIONS, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processPayoneerTransConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();