import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processScheduledTransactionsConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processScheduledTransactionsConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.receiverMsisdn = '0';
                if(data?.Header?.UseCase === 'MoneyTransferC2C') {
                    initTransData.receiverMsisdn = data?.Header?.Identity?.ReceiverParty?.Identifier || '0';
                } else if(data?.Header?.UseCase === 'MoneyTransferB2B') {
                    initTransData.receiverMsisdn = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'OrganizationOwnerMSISDN'; })?.Value || '0';
                } else if(data?.Header?.UseCase === 'CNICPayment') {
                    initTransData.receiverMsisdn = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'ReceiverMSISDN'; })?.Value || '0';
                }
                initTransData.transType = data?.Header?.UseCase || '';
                initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.transFrequency = 0;
                if(data?.CustomObject?.txnFrequency === 'Daily') {
                    initTransData.transFrequency = 1;
                } else if(data?.CustomObject?.txnFrequency === 'Weekly') {
                    initTransData.transFrequency = 7;
                } else if(data?.CustomObject?.txnFrequency === 'Monthly') {
                    initTransData.transFrequency = 30;
                } else if(data?.CustomObject?.txnFrequency === 'Yearly') {
                    initTransData.transFrequency = 365;
                }
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.repeatTransDuration = data?.CustomObject?.txnFrequency || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.SCHEDULED_TRANSACTIONS, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.SCHEDULED_TRANSACTIONS, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processScheduledTransactionsConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();