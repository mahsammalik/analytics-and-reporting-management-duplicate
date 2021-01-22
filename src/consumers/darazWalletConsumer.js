import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processDarazWalletConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processDarazWalletConsumer in class Processor' });
            //console.log(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.actualAmount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.balanceBefore = 0;
                initTransData.channel = data.Header.SubChannel;
                initTransData.walletEmail = '';
                initTransData.walletNumber = 0;
                initTransData.walletOwner = '';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.failureReason = '';
                initTransData.msisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.promoCode = '';
                initTransData.promoCodeAmount = 0;
                initTransData.status = isConfirm ? 'Completed' : 'Pending';
                initTransData.TID = Number(data?.Result?.TransactionID || '0');
                initTransData.userEmail = '';

                console.log(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CONSUMER_DARAZ_WALLET, initTransData);
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processDarazWalletConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();