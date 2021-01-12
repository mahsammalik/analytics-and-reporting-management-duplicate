import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2.schema;

class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([
            config.kafkaBroker.topics.initTrans_BusTicket
        ]);
    }

    setConsumer() {
        this.event.addConsumerOnDataEvent(async function (msg) {
            try {
                logger.info({ event: 'Entered function', functionName: 'setConsumer in class subscriber' });
                console.log("message: ", msg)

                if (msg.topic === config.kafkaBroker.topics.initTrans_BusTicket){
                    logger.info({message:'*********** Init Trans Bus Ticket *****************'});
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.BUS_TICKET, payload);
                        //console.log(response);
                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'setConsumer in class subscriber - init trans Bus Ticket', error: { message: error.message, stack: error.stack } });
                        logger.info({ event: 'Exited function', functionName: 'setConsumer in class subscriber - init trans Bus Ticket' });
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