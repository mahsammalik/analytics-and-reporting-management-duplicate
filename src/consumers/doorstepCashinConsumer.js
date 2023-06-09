import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = config.DB2_Jazz.schema;

class Processor {

    constructor() { }

    async processDoorstepCashinConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processDoorstepCashinConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            initTransData.date = data?.tx_createdAt || null;
            if(initTransData.date != null) {
                initTransData.date = moment(initTransData.date).format('YYYY-MM-DD HH:mm:ss');
            }
            initTransData.amount = Number(data?.amount || '0');
            initTransData.address = data?.address || '';
            initTransData.city = data?.city || '';
            initTransData.lat = Number(data?.lat || '0');
            initTransData.reqStatus = data?.bookmeLastSentPayload?.data?.status || '';
            initTransData.custMsisdn = data?.msisdn || '0';
            initTransData.riderName = data?.bookmeLastSentPayload?.data?.partner?.name || '';
            initTransData.riderMsisdn = data?.bookmeLastSentPayload?.data?.partner?.mobile_no || '0';             
            initTransData.channel = data?.channel || 'Mobile';
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if (process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.DOORSTEP_CASHIN, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.DOORSTEP_CASHIN, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processDoorstepCashinConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();