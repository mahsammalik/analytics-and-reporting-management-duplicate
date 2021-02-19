import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processPayoneerTransConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processPayoneerTransConsumer in class Processor' });
            //console.log(data);
            let initTransData = {};

            initTransData.msisdn = Number(data?.msisdn || '0');
            initTransData.payUsername = data?.account_details?.contact?.email || '';
            initTransData.pkrAmount = Number(data?.amountInPKR || '0');
            initTransData.usdAmount = Number(data?.transferAmount || '0');
            initTransData.exchangeRate = Number(data?.exchangeRate || '0');
            initTransData.currency = data?.currency || '';
            initTransData.description = data?.txLogs || '';
            initTransData.activityDate = data?.updatedAt || null;
            if(initTransData.activityDate != null) {
                initTransData.activityDate = initTransData.activityDate.replace('T', ' ').replace('Z', '');
                initTransData.activityDate = initTransData.activityDate.includes('.') ? initTransData.activityDate.split('.')[0] : initTransData.activityDate;
            }
            initTransData.monetaStatus = data?.txStatus || '';
            initTransData.channel = data?.channel || 'Mobile';
            initTransData.TID = Number(data?.paymentID || '0');

            console.log(JSON.stringify(initTransData));

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