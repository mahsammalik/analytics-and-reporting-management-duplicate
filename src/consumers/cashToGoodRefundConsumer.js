import { logger } from '/util/';
import DB2Connection from '../util/DB2Connection';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;
// const SCHEMA = "COMMON"

class Processor {

    constructor() { }

    async processCashToGoodRefundConsumer(data) {

        logger.info({
            event: 'Entered function',
            functionName: 'processCashToGoodRefundConsumer in class Processor',
            data: data
        });

        let confirmData = {};

        try {

            confirmData.refundTransactionId = data.Result?.TransactionID;
            confirmData.redeemTransactionId = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'redeemTransactionId'; })?.Value || '';
            confirmData.cashToGoodRefund = true;

            if (JSON.stringify(confirmData) !== '{}') {

                logger.info({
                    event: 'cashtogood refund data to be inserted in db2',
                    functionName: 'processCashToGoodRefundConsumer in class Processor',
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
                functionName: 'processCashToGoodRefundConsumer in class Processor',
                error: { message: error.message, stack: error.stack }
            });

        }
    }

}

export default new Processor();