import { logger } from '/util/';
import DB2Connection from '../util/DB2Connection';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;
// const SCHEMA = "COMMON"

class Processor {

    constructor() { }

    async processMultiPaymentQrPaymentConsumer(data) {

        logger.info({
            event: 'Entered function',
            functionName: 'processMultiPaymentQrPaymentConsumer in class Processor',
            data: data
        });

        let confirmData = {};

        try {

            confirmData.redeemTransactionId = data.Response.data?.redeemTransactionID;
            confirmData.qrPaymentTransactionId = data.Response.data?.txID;
            confirmData.depositTransactionId = data.Response.data?.depositTransactionID;
            confirmData.multiPaymentQrpayment = true;

            if (JSON.stringify(confirmData) !== '{}') {

                logger.info({
                    event: 'multi payment qr payment data to be inserted in db2',
                    functionName: 'processMultiPaymentQrPaymentConsumer in class Processor',
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
                functionName: 'processMultiPaymentQrPaymentConsumer in class Processor',
                error: { message: error.message, stack: error.stack }
            });

        }
    }

}

export default new Processor();