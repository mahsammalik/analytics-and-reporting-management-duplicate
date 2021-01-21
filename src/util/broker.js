import Kafka from 'node-rdkafka';
import path from 'path';
import { logger } from '/util/';
const brokers = process.env.KAFKA_BOOTSTRAP_SERVERS || config.kafkaBroker.brokers;

class Broker {
    constructor(topicsArray) {

        logger.info({ event: 'Event Stream constructor called', functionName: 'constructor in Broker', features: Kafka.features, brokers, topicsArray });

        this.producer = this._ConnectProducer();
        this.consumer = this._ConnectConsumer(topicsArray);
    }


    _ConnectProducer() {
        logger.info({ event: '_connectProducer called' });
        const brokerConfig = { ...config.kafkaBroker.producerConfig };

        brokerConfig.dr_msg_cb = true; // Enable delivery reports with message payload
        const producer = new Kafka.Producer(brokerConfig);

        producer.setPollInterval(config.kafkaBroker.pollInterval);

        // only if debug option set in config
        producer.on('event.log', function (msg) {
            logger.debug({ event: 'debug from producer:' + msg });
        });

        // logging all errors
        producer.on('event.error', function (err) {
            logger.error({ event: 'error from producer: %s' + err });
        });

        // wait for the ready event before producing
        producer.on('ready', function (arg) {
            logger.info({ event: 'producer ready' + arg });
        });

        // log delivery reports
        producer.on('delivery-report', function (err, dr) {
            if (err) {
                logger.error({ event: 'Delivery failed: %j' + err });
                // consider retrying
            } else {
                logger.info({ event: 'Delivery success: %j' + dr });
            }
        });

        // starting the producer
        producer.connect();

        return producer;
    }


    _ConnectConsumer(topicsArray) {
        try {
            const consumer = new Kafka.KafkaConsumer(config.kafkaBroker.consumerConfig);
            console.log(topicsArray);
            logger.debug({ topicsArray });

            // logging all errors
            consumer.on('event.error', function (err) {
                logger.error({
                    event: 'Error thrown',
                    functionName: "_ConnectConsumer in broker",
                    error: err
                });
            });

            // counter to commit offsets every numMessages are received
            var counter = 0;
            var numMessages = config.kafkaBroker.numMessages;

            consumer.on('ready', function (arg) {
                logger.info({ event: `consumer ready`, arg });

                consumer.subscribe(topicsArray);
                // start consuming messages
                // setInterval(function() {
                //   consumer.consume(10);
                // }, 100);
                consumer.consume();
            });

            /*consumer.on('data', function (m) {
              counter++;
    	
              // committing offsets every numMessages
              if (counter % numMessages === 0) {
                logger.info('calling commit');
                consumer.commit(m);
              }
    	
              // convert value to JSON (if it is) before logging
              try {
                m.value = JSON.parse(m.value.toString());
              } catch {}
    	
              // convert key to string before logging
              if (m.key) m.key = m.key.toString();
    	
              // Output the actual message contents
              logger.info('data received value');
              logger.info(' value is ' + m.value);
              logger.info(' Printing topic Name' + m.topic);
    	
            });*/

            // starting the consumer
            consumer.connect();
            return consumer;
        } catch (error) {
            logger.error({
                event: "Error thrown",
                functionName: "produceMessage",
                error: { message: error.message, stack: error.stack }
            });
        }

    }



    addConsumerOnDataEvent(func) {

        //counter to commit offsets every numMessages are received
        var counter = 0;
        var numMessages = config.kafkaBroker.numMessages;
        let consumer = this.consumer;

        consumer.on('data', function (msg) {

            // // committing offsets every numMessages
            // if (counter % numMessages === 0) {
            //   consumer.commit(msg);
            // }
            logger.debug({ msg });
            func(msg);
        });


    }

    produceMessage(msg, topicName) {

        logger.info({ event: " About to produce message", function: "produceMessage in Broker" });
        // if partition is set to -1, librdkafka will use the default partitioner
        const partition = -1;
        const value = Buffer.from(JSON.stringify(msg));
        logger.debug({ value });

        try {
            // this.producer.on('ready', (arg) => {
            this.producer.produce(topicName, partition, value);
            //     logger.info({ event: `producer ready ${arg}` });
            // });


        } catch (error) {
            logger.error({
                event: "Error thrown",
                functionName: "produceMessage",
                error: { message: error.message, stack: error.stack }
            });
        }

    }


}

export default Broker;