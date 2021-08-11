import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processOnboardingConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processOnboardingConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if(data != undefined || data != null) {
            // All dates and time values that are null or empty are set to '0001-01-01' & '00:00:00' to avoid invalid string for timestamp error
            initTransData.Date_of_App_Download = (data.Date_of_App_Download != null && data.Date_of_App_Download != '') ? data.Date_of_App_Download : '0001-01-01';
            initTransData.Activity_Date = (data.Activity_Date != null && data.Activity_Date != '') ? data.Activity_Date : '0001-01-01';
            initTransData.Date_of_First_Open = (data.Date_of_First_Open != null && data.Date_of_First_Open != '') ? data.Date_of_First_Open : '0001-01-01';
            initTransData.Wallet_Registration_Date = (data.Wallet_Registration_Date != null && data.Wallet_Registration_Date != '') ? data.Wallet_Registration_Date : '0001-01-01';
            initTransData.Activity_Time = (data.Activity_Time != null && data.Activity_Time != '') ? data.Activity_Time : '00:00:00';
            initTransData.Reward_posting_Date = (data.Reward_posting_Date != null && data.Reward_posting_Date != '') ? data.Reward_posting_Date : '0001-01-01';
            if(initTransData.Reward_posting_Date != null) {
                initTransData.Reward_posting_Date = moment(initTransData.Reward_posting_Date).format('YYYY-MM-DD HH:mm:ss');
            }
            initTransData.Date_of_Sign_up = (data.Date_of_Sign_up != null && data.Date_of_Sign_up != '') ? data.Date_of_Sign_up : null;
            if(initTransData.Date_of_Sign_up != null) {
                initTransData.Date_of_Sign_up = moment(initTransData.Date_of_Sign_up).format('YYYY-MM-DD HH:mm:ss');
            }
            initTransData.OS = data.OS;
            initTransData.Login_Merchant_ID = data.Login_Merchant_ID;
            initTransData.IMEI_Number = isNaN(Number(data.IMEI_Number)) ? 0 : Number(data.IMEI_Number);
            initTransData.App_Version = data.App_Version;
            initTransData.Device_Model = data.Device_Model;
            initTransData.Channel = data.Channel;
            initTransData.Count_of_Guest_mode_visits = data.Count_of_Guest_mode_visits;
            initTransData.Merchant_MSISDN = data.Merchant_MSISDN;
            initTransData.New_Existing_User = data.New_Existing_User;
            initTransData.Account_Level = data.Account_Level;
            initTransData.Consumer_Account_Status = data.Consumer_Account_Status;
            initTransData.Account_Level_For_existing_User = data.Account_Level_For_existing_User;
            initTransData.Sign_up_Step = data.Sign_up_Step;
            initTransData.Verification_Mode = data.Verification_Mode;
            initTransData.Regsitration_request = data.Regsitration_request;
            initTransData.Registration_Status = data.Registration_Status;
            initTransData.Personal_Name = data.Personal_Name;
            initTransData.Business_Name = data.Business_Name;
            initTransData.CRM_Status = data.CRM_Status;
            initTransData.Reward_Amount = Number(data.Reward_Amount);
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    logger.debug('calling development insertion')
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.ONBOARDING, initTransData);
                }
                else {
                    logger.debug('calling prod insertion')
                    await DB2Connection.insertTransactionHistory("MERCHANT", config.reportingDBTables.ONBOARDING, initTransData);
                }
            }
        }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processOnboardingConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();