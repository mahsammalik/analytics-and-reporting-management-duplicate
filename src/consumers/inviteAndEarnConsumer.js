import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processInviteAndEarnConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processInviteAndEarnConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.acceptDate = null;
                initTransData.acceptTime = null;
                initTransData.accountStatus = '';
                initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'Amount'; })?.Value || '0');
                initTransData.amountPostedDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.amountPostedDate !== '') {
                    initTransData.amountPostedDate = moment(initTransData.amountPostedDate).format('YYYY-MM-DD');
                }
                initTransData.amountPostedTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.amountPostedTime !== '') {
                    initTransData.amountPostedTime = moment(initTransData.amountPostedTime, 'HHmmss').format('HH:mm:ss');
                }
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.inviteDate = null;
                initTransData.inviteTime = null;
                initTransData.inviterMsisdn = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'CustomerMSISDN'; })?.Value || '0');
                initTransData.inviterName = '';
                initTransData.message = '';
                initTransData.module = '';
                initTransData.receiverName = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'BeneficiaryName'; })?.Value || ''
                initTransData.receiverMsisdn = 0;
                initTransData.registerChannel = '';
                initTransData.reqCategory = '';
                initTransData.reqChannel = '';
                initTransData.reqStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.INVITEANDEARN, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.INVITEANDEARN, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processInviteAndEarnConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();