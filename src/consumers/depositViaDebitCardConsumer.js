import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processDVDCConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processDVDCConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                // get msisdn from Request object (if avaialable)
                initTransData.msisdn = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'CustomerMSISDN'; })?.Value || '0';
                // if msisdn not found in Request object then get it from CustomObject
                if(initTransData.msisdn === '0')
                {
                    initTransData.msisdn = data?.CustomObject?.customerMSISDN || '0';
                }
                initTransData.cardNum = data?.CustomObject?.maskedCardNo || '0';
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.retrivalRef = data?.CustomObject?.txnRefNo || '';
                initTransData.cashInTransID = 0;
                initTransData.cashInTransStatus = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'IsSuccess'; })?.Value || false;
                initTransData.cashInTransStatus = initTransData.cashInTransStatus == true ? 'Completed' : ''
                initTransData.cashInTransTime = null,
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.DEPOSIT_VIA_CARD, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.DEPOSIT_VIA_CARD, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processDVDCConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();