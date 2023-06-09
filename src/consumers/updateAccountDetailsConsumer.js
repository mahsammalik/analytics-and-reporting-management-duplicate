import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = config.DB2_Jazz.schema;

class Processor {

    constructor() {}

    async processUpdateAccountDetailsConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processUpdateAccountDetailsConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.msisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
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
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.useCase = data?.Header?.UseCase || '';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(initTransData.useCase.toLowerCase() === 'changempin') {
                    if(process.env.NODE_ENV === 'development') {
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CHANGE_MPIN, initTransData);
                    }
                    else {
                        await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.CHANGE_MPIN, initTransData);
                    }
                }
                
                if(initTransData.useCase.toLowerCase() === 'resetmpin') {
                    if(process.env.NODE_ENV === 'development') {
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.RESET_MPIN, initTransData);
                    }
                    else {
                        await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.RESET_MPIN, initTransData);
                    }
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processUpdateAccountDetailsConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();