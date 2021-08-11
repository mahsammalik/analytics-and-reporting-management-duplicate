import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processDeviceAuthConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processDeviceAuthConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if(data != undefined || data != null)
            {
                initTransData.msisdn = data.msisdn;
                initTransData.app_version = data.appVersion;
                initTransData.deviceMake = data.deviceMake;
                initTransData.device_model = data.deviceModel;
                initTransData.deviceType = data.deviceType;
                initTransData.cust_ip = data.ipAddress;
                initTransData.imei1 = data.deviceIMEI_1;
                initTransData.imei2 = data.deviceIMEI_2;
                initTransData.new_imei = data?.newIMEI || '';
                initTransData.dateTime = moment(data.registrationTS, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                initTransData.authAttempted = data.authenticationAttempted? "Yes":"No";
                initTransData.authSuccess = data.authenticationSuccess? "Yes":"No";
                initTransData.doUpdate = data.doUpdate;
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));

                if (JSON.stringify(initTransData) !== '{}') {
                    if(process.env.NODE_ENV === 'development') {
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.DEVICE_AUTH, initTransData);
                    }
                    else {
                        await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.DEVICE_AUTH, initTransData);
                    }
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processDeviceAuthConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();