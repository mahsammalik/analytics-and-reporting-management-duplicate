import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processAccountUpgradeConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processAccountUpgradeConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.transType === 'UpgradeSuccess') {
                initTransData.date = data.txnDateTime.includes('.') ? data.txnDateTime.split('.')[0] : data.txnDateTime;
                initTransData.msisdn = Number(data.msisdn);
                initTransData.cnic = data.cnic;
                initTransData.nadraResponse = data?.nadraResponse?.responseStatus || '';
                initTransData.fingerprintTime = data?.nadraResponse?.sendTime || '';
                initTransData.appUserDetails = data?.deviceID || '';
                initTransData.nadraError = data?.nadraResponse?.return?.ApiResponse?.error?.errorDescriptions?.string || '';
                initTransData.channel = data?.channel || '';
                initTransData.merchMsisdn = Number(data?.nadraResponse?.msisdn || '0');
                initTransData.merchNic = data?.nadraResponse?.cnicNo || '';
                initTransData.personalName = data?.nadraResponse?.nameEn || '';
                initTransData.businessName = '';
            }
            else // case of CPS Failure or Nadra Failure
            {
                initTransData.date = data.txnDateTime.includes('.') ? data.txnDateTime.split('.')[0] : data.txnDateTime;
                initTransData.msisdn = Number(data.msisdn);
                initTransData.cnic = data.cnic;
                initTransData.nadraResponse = data?.nadraResponse?.return?.ApiResponse?.error?.result?.responseStatus || '';
                initTransData.fingerprintTime = data?.nadraResponse?.return?.ApiResponse?.error?.result?.sendTime || '';
                initTransData.appUserDetails = data?.deviceID || '';
                initTransData.nadraError = data?.nadraResponse?.return?.ApiResponse?.error?.errorDescriptions?.string || '';
                initTransData.channel = data?.channel || '';
                initTransData.merchMsisdn = Number(data?.nadraResponse?.return?.ApiResponse?.error?.result?.msisdn || '0');
                initTransData.merchNic = data?.nadraResponse?.return?.ApiResponse?.error?.result?.cnicNo || '';
                initTransData.personalName = data?.nadraResponse?.return?.ApiResponse?.error?.result?.nameEn || '';
                initTransData.businessName = '';
            }
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.ACCOUNT_UPGRADE, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.ACCOUNT_UPGRADE, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processAccountUpgradeConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();