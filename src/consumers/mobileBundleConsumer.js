import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async mobileBundleConsumerProcessor(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'mobileBundleConsumerProcessor in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                initTransData.bundleType = data?.CustomObject?.bundleType || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.MOBILE_BUNDLE, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.MOBILE_BUNDLE, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'mobileBundleConsumerProcessor in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }

    async mobileBundleConsumerProcessorZong(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'mobileBundleConsumerProcessorZong in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                initTransData.bundleType = '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.responseCode = data?.Result?.ResultCode || '';
                initTransData.responseDesc = data?.Result?.ResultDesc || '';
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.MOBILE_BUNDLE_ZONG, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.MOBILE_BUNDLE_ZONG, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'mobileBundleConsumerProcessorZong in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();