import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processEVouchersConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processEVouchersConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.actualAmount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DueAmount'; })?.Value || '0');
                initTransData.amountDollar = 0;
                initTransData.channel = data.Header.SubChannel;
                initTransData.company = data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'CompanyShortName'; })?.Value || '';                
                initTransData.email = '';
                initTransData.failReason = '';
                initTransData.msisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.promoAmount = 0;
                initTransData.promoCode = '';
                initTransData.status = 'Pending';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = Number(data?.Result?.TransactionID || '0');

                if(isConfirm) {
                    initTransData.actualAmount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.company = data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'BeneficiaryName'; })?.Value || '';                
                    initTransData.status = 'Completed';
                }

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.EVOUCHER, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.EVOUCHER, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processEVouchersConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();