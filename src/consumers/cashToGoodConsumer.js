import { logger } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processCashToGoodConsumer(data) {

        logger.info({
            event: 'Entered function',
            functionName: 'processCashToGoodConsumer in class Processor',
            data: data
        });

        let confirmData = {};

        try {

            confirmData.senderMsisdn = data.Header.Identity?.Initiator.Identifier;

            confirmData.senderName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {
                return param.Key == 'senderName';
            })?.Value || '';

            confirmData.txID = data.Result.TransactionID;

            confirmData.txEndDate = data.Result?.ResultParameters?.ResultParameter?.find((param) => {
                return param.Key == 'TransEndDate';
            })?.Value || '';

            if (confirmData.txEndDate !== '') {
                confirmData.txEndDate = moment(confirmData.txEndDate).format('YYYY-MM-DD');
            }

            confirmData.txEndTime = data.Result?.ResultParameters?.ResultParameter?.find((param) => {
                return param.Key == 'TransEndTime';
            })?.Value || '';

            if (confirmData.txEndTime !== '') {
                const time = moment(confirmData.txEndTime, 'HHmmss').format('HH:mm:ss');
                confirmData.txEndTime = confirmData.txEndDate + " " + time;
            }

            confirmData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {
                return param.Key == 'Amount';
            })?.Value || '0.00');

            confirmData.chCode = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {
                return param.Key == 'ChannelCode';
            })?.Value || '0';

            confirmData.receiverMsisdn = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {
                return param.Key == 'receiverMsisdn';
            })?.Value || '';

            confirmData.receiverName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {
                return param.Key == 'receiverName';
            })?.Value || '';

            confirmData.categoryName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {
                return param.Key == 'categoryName';
            })?.Value || '';

            confirmData.status = 'Complete';

            if (JSON.stringify(confirmData) !== '{}') {

                if (process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CASHTOGOOD, confirmData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.CASHTOGOOD, confirmData);
                }
            }
        } catch (error) {

            logger.error({
                event: 'Error thrown ',
                functionName: 'processCashToGoodConsumer in class Processor',
                error: { message: error.message, stack: error.stack }
            });

        }
    }

}

export default new Processor();