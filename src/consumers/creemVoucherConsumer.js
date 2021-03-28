import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([
            config.kafkaBroker.topics.queryTrans_creemVoucher
        ]);
    }

    setConsumer() {
        this.event.addConsumerOnDataEvent(async function (msg) {
            try {
                logger.info({ event: 'Entered function', functionName: 'setConsumer in class subscriber' });
                logger.debug("message: ", msg)

                if (msg.topic === config.kafkaBroker.topics.queryTrans_creemVoucher){
                    logger.debug('*********** Init Trans Creem Vouchers *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        // TODO: DB2 Table has to be created before calling insert function
                        //await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.COMMON_EVENT_TICKET, payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'setConsumer in class subscriber - init trans Creem Vouchers', error: { message: error.message, stack: error.stack } });
                        logger.info({ event: 'Exited function', functionName: 'setConsumer in class subscriber - init trans Creem Vouchers' });
                    }
                }
            } catch (error) {
                logger.error({ event: 'Error thrown ', functionName: 'setConsumer in class subscriber', error: {message:error.message, stack: error.stack} });
                //throw new Error(error);
            }
        });
    }

}

export default Subscriber;