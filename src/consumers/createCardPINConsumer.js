import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processCreateCardPINConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processCreateCardPINConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.action = 'Create Card PIN';
                initTransData.cardNum = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {return param.Key == 'cardNumber'; })?.Value || '';
                initTransData.cardCategory = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {return param.Key == 'cardCategory'; })?.Value || '';
                initTransData.cardType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {return param.Key == 'cardType'; })?.Value || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.cnic = '';
                initTransData.msisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.pinCreated = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'TargetCardPIN'; })?.Value || '';
                initTransData.transactionStatus = 'Completed';
                initTransData.suplCardCnic = '';
                initTransData.suplCardNum = 0;
                initTransData.TID = Number(data?.Result?.TransactionID || '0');
                
                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CREATE_CARD_PIN, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.CREATE_CARD_PIN, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processCreateCardPINConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();