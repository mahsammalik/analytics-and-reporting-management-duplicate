import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async mobileBundleConsumerProcessor(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'mobileBundleConsumerProcessor in class Processor' });
            //console.log(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                initTransData.bundleType = '';
                initTransData.channel = data.Header.SubChannel;
                initTransData.initiatorMsisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                initTransData.targetMsisdn = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0');
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.TID = Number(data?.Result?.TransactionID || '0');

                console.log(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.COMMON_MOBILE_BUNDLE, initTransData);
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'mobileBundleConsumerProcessor in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();