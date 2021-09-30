import { logger } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;
// const SCHEMA = "COMMON"

class Processor {

    constructor() { }

    async processCashToGoodRedeemConsumer(data) {

        logger.info({
            event: 'Entered function',
            functionName: 'processCashToGoodRedeemConsumer in class Processor',
            data: data
        });

        let confirmData = {};

        try {

            confirmData.senderMsisdn = data.Header.Identity?.Initiator.Identifier;

            confirmData.redeemTransactionId = data.Result.TransactionID;

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

            confirmData.completionStatus = 'Complete';

            if (JSON.stringify(confirmData) !== '{}') {

                logger.info({
                    event: 'cashtogood redeem data to be inserted in db2',
                    functionName: 'processCashToGoodRedeemConsumer in class Processor',
                    data: confirmData
                });

                if (process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CASHTOGOOD_REDEEM, confirmData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.CASHTOGOOD_REDEEM, confirmData);
                }
            }
        } catch (error) {

            logger.error({
                event: 'Error thrown ',
                functionName: 'processCashToGoodRedeemConsumer in class Processor',
                error: { message: error.message, stack: error.stack }
            });

        }
    }

}

export default new Processor();