import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processNewSignupRewardConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processNewSignupRewardConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.postSignupBonus = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0';
                initTransData.msisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.amountPosted = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    initTransData.transactionTime = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                }
                initTransData.postingStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.NEW_SIGNUP_REWARD, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.NEW_SIGNUP_REWARD, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processNewSignupRewardConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();