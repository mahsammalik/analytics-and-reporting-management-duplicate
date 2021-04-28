import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processCareemVoucherConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processCareemVoucherConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DueAmount'; })?.Value || '0');
                initTransData.msisdn = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == "CustomerMSISDN";})?.Value || '0');
                initTransData.TID = Number(data?.Result?.TransactionID || '0');
                initTransData.status = isConfirm ? 'Completed' : 'Pending';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CAREEM_VOUCHER, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.CAREEM_VOUCHER, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processCareemVoucherConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();