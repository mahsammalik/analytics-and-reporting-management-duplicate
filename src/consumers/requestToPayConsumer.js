import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processRequestToPayConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processRequestToPayConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.businessLink = '';
                initTransData.businessLogo = null,
                initTransData.businessName = '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.docAttached = '',
                initTransData.email = '';
                initTransData.emailID = '';
                initTransData.existingAcc = '';
                initTransData.extensionRequested = 0;
                initTransData.jazzcashAcc = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.mobileNumber = 0;
                initTransData.name = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'BeneficiaryName'; })?.Value || '';
                initTransData.payerName = '';
                initTransData.paymentChannel = '';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.paymentDueDate = null;
                initTransData.remindersSent = 0;
                initTransData.reqID = 0;
                initTransData.reqItems = '';
                initTransData.reqMedium = '';
                initTransData.reqType = '';
                initTransData.reqDate = null;
                initTransData.serviceDescriptin = '';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.tax_ship_disc_applied = '';
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.REQUEST_TO_PAY, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("MERCHANT", config.reportingDBTables.REQUEST_TO_PAY, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processRequestToPayConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();