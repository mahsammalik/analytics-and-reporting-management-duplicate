import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2.schema;

class Processor {

    constructor() { }

    async processDonationConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processDonationConsumer in class Processor' });
            //console.log(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.email = data.CustomObject?.email || '';
                initTransData.channel = data.Header.SubChannel;
                initTransData.failureReason = '';
                initTransData.fund = initTransData.amount;
                initTransData.msisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.organization = data.CustomObject?.orgName || '';
                initTransData.transactionStatus = 'Pending';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = Number(data?.Result?.TransactionID || '0');

                console.log(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.DONATION, initTransData);
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processDonationConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();