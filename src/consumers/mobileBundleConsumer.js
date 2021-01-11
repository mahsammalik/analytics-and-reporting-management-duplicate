import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2.schema;

class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([
            config.kafkaBroker.topics.initTrans_MobileBundle
        ]);
        //console.log("Consturctor called")
    }

    setConsumer() {
        this.event.addConsumerOnDataEvent(async function (msg) {
            try {
                logger.info({ event: 'Entered function', functionName: 'setConsumer in class subscriber' });

                if (msg.topic === config.kafkaBroker.topics.initTrans_MobileBundle){
                    logger.info('*********** Init Trans Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        const response = await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.MOBILE_BUNDLE, payload);
                        console.log(response);
                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'setConsumer in class subscriber - init trans Mobile Bundle', 'error': { message: error.message, stack: error.stack } });
                        logger.info({ event: 'Exited function', functionName: 'setConsumer in class subscriber - init trans Mobile Bundle' });
                        console.log(error)
                    }
                }
            } catch (error) {
                logger.error({ event: 'Error thrown ', functionName: 'setConsumer in class subscriber', error });
                //throw new Error(error);
            }
        });
    }

}

export default Subscriber;