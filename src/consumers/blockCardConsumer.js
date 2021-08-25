import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processBlockCardConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processBlockCardConsumer in class Processor' });
            
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.action = data?.Request?.Trnasaction?.CommandID || data?.Header?.UseCase || 'Block Card';
                initTransData.cardNum = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {return param.Key == 'cardNumber'; })?.Value || '';
                initTransData.cardCategory = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {return param.Key == 'cardCategory'; })?.Value || '';
                initTransData.cardType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {return param.Key == 'cardType'; })?.Value || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.msisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate, 'YYYYMMDD').format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.transactionStatus = 'Completed';
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CARD_BLOCK, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.CARD_BLOCK, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processBlockCardConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();