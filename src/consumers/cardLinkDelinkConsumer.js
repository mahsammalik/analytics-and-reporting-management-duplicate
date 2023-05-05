import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = config.DB2_Jazz.schema;

class Processor {

    constructor() { }

    async processCardLinkDelinkConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processCardLinkDelinkConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            initTransData.transDate = data.txnDateTime;
            initTransData.msisdn = data?.msisdn || '0';
            initTransData.channel = data?.channel || '';
            initTransData.isDelinkSuccess = data?.isDelinkSuccess || '';
            initTransData.usecase = data.usecase;
            initTransData.retrieveRef = data?.txnRefNo || '';
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    if(initTransData.usecase === 'cardLink') {
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CARD_LINKING, initTransData);
                    } else if(initTransData.usecase === 'cardDelink') {
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.CARD_DELINK, initTransData);
                    }
                }
                else {
                    if(initTransData.usecase === 'cardLink') {
                        await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.CARD_LINKING, initTransData);
                    } else if (initTransData.usecase === 'cardDelink') {
                        await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.CARD_DELINK, initTransData);
                    }
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processCardLinkDelinkConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();