import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processDonationConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processDonationConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.email = data.CustomObject?.email || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.failureReason = '';
                initTransData.fund = initTransData.amount;
                initTransData.msisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.organization = data.CustomObject?.orgName || '';
                initTransData.transactionStatus = isConfirm? 'Completed' : 'Pending';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);
            }
            else
            {
                initTransData.isFailedTrans = true;
                if(!isConfirm)
                {
                    initTransData.isFailedInit = true;
                    initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.email = data.CustomObject?.email || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.failureReason = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'FailedReason'; })?.Value || '';
                    initTransData.fund = initTransData.amount;
                    initTransData.msisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.organization = data.CustomObject?.orgName || '';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);    
                }
                else
                {
                    initTransData.isFailedConfirm = true;
                    initTransData.TID = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'TransID'; })?.Value || '0';
                    initTransData.failureReason = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'FailedReason'; })?.Value || '';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);    
                }
            }
            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.DONATION, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.DONATION, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processDonationConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();