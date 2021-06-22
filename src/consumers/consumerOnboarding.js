import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processConsumerOnboarding(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processConsumerOnboarding in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if(data != undefined || data != null)
            {
                initTransData.loginID = Number(data.LoginID);
                initTransData.cnic = data.cnic;
                initTransData.reg_status = data.RegistrationStatus;
                initTransData.activity_date = moment(data.ActivityDate).format('DD-MM-YYYY');
                initTransData.activity_time = moment(data.ActivityTime).format('HH:mm:SS');
                initTransData.new_existing_user = data.ExistingUser? "Existing":"New";
                initTransData.walletRegDate = moment(data.WalletRegistrationDate).format('DD-MM-YYYY HH:mm:SS');
                initTransData.app_version = data.AppVersion;
                initTransData.device_model = data.DeviceModel;
                initTransData.os = data.OS;
                initTransData.channel = data?.channel || "consumerApp";
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));

                if (JSON.stringify(initTransData) !== '{}') {
                    if(process.env.NODE_ENV === 'development') {
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.APP_SIGNUP, initTransData);
                    }
                    else {
                        await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.APP_SIGNUP, initTransData);
                    }
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processConsumerOnboarding in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();