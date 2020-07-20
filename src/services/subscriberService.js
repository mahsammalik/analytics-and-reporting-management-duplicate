import Broker from "../util/broker";


class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([config.kafkaBroker.init_topic, config.kafkaBroker.confirm_topic]);
    }

    setConsumer() {

        this.event.addConsumerOnDataEvent(function (msg) {

            if (msg.topic === config.kafkaBroker.init_topic)
                logger.info('*********** INIT TOPIC *****************');

            if (msg.topic === config.kafkaBroker.confirm_topic)
                logger.info('*********** Confirm TOPIC *****************');

            try {
                msg.value = JSON.parse(msg.value.toString());
            } catch {}

            // convert key to string before logging
            if (msg.key) msg.key = msg.key.toString();

            // Output the actual message contents
            logger.info('data received value');
            logger.info(' value is ' + msg.value);
            logger.info(' Printing topic Name' + msg.topic);

        });

    }

}

export default Subscriber;