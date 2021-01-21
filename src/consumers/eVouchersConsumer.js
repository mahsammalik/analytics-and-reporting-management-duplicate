import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([
            config.kafkaBroker.topics.initTrans_eVouchers
        ]);
    }

    setConsumer() {
        this.event.addConsumerOnDataEvent(async function (msg) {
            try {
                logger.info({ event: 'Entered function', functionName: 'setConsumer in class subscriber' });
                console.log("message: ", msg)

                if (msg.topic === config.kafkaBroker.topics.initTrans_eVouchers){
                    console.log('*********** Init Trans eVouchers *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.COMMON_EVOUCHER, payload);
                        //console.log(response);
                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'setConsumer in class subscriber - init trans eVouchers', error: { message: error.message, stack: error.stack } });
                        logger.info({ event: 'Exited function', functionName: 'setConsumer in class subscriber - init trans eVouchers' });
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