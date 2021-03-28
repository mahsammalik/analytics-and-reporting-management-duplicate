import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processUpdateAccountDetailsConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processUpdateAccountDetailsConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.msisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.transactionStatus = 'Completed';
                initTransData.imei = 0;
                initTransData.channel = data?.Header?.SubChannel || '';
                initTransData.useCase = data?.Header?.UseCase || '';

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(initTransData.useCase.toLowerCase() === 'changempin') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CONSUMER_CHANGE_MPIN, initTransData);
                }
                
                if(initTransData.useCase.toLowerCase() === 'resetmpin') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CONSUMER_RESET_MPIN, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processUpdateAccountDetailsConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();