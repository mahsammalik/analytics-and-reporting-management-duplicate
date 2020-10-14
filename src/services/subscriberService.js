import { logger, Broker } from '/util/';

class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([config.kafkaBroker.init_topic, config.kafkaBroker.confirm_topic, config.kafkaBroker.initTrans_auditLog, config.kafkaBroker.confirmTrans_auditLog, config.kafkaBroker.intTrans_sendMoney_c2c]);
    }

    setConsumer() {

        this.event.addConsumerOnDataEvent(async function(msg) {
            try {
                logger.info({ event: 'Entered function', functionName: 'setConsumer in class subscriber' });

                if (msg.topic === config.kafkaBroker.init_auditLog) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                }

            } catch (error) {
                logger.error({ event: 'Error thrown ', functionName: 'setConsumer in class subscriber', error });
                throw new Error(e);
            }

        });

    }

}

export default Subscriber;