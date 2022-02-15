import Kafka from 'node-rdkafka';
import path from 'path';
import { logger } from '/util/';
import os from 'os';
const brokers = process.env.KAFKA_BOOTSTRAP_SERVERS || config.kafkaBroker.brokers;
const CONSUMER_GROUP_ID = process.env.CONSUMER_GROUP_ID || config.kafkaBroker.consumerConfig.group_id;
const CONSUME_INTERVAL = Number(process.env.KAFKA_TOPICS_CONSUME_INTERVAL) || config.kafkaBroker.topics_consume_interval

class Broker {
    constructor(topicsArray) {

        logger.debug({ event: 'Event Stream constructor called', functionName: 'constructor in Broker', features: Kafka.features, brokers, topicsArray });
        logger.info({ event: 'Event Stream constructor called', functionName: 'constructor in Broker', message: `Consumer will consume messages in interval: ${CONSUME_INTERVAL} ms}`});

        this.producer = this._ConnectProducer();
        this.consumer = this._ConnectConsumer(topicsArray);
    }


    _ConnectProducer() {
        logger.debug({ event: '_connectProducer called' });
        const brokerConfig = {...config.kafkaBroker.producerConfig };

        brokerConfig.dr_msg_cb = true; // Enable delivery reports with message payload
        const producer = new Kafka.Producer(brokerConfig);

        producer.setPollInterval(config.kafkaBroker.pollInterval);

        // only if debug option set in config
        producer.on('event.log', function(msg) {
            logger.debug({ event: 'debug from producer:' + msg });
        });

        // logging all errors
        producer.on('event.error', function(err) {
            logger.error({ event: 'error from producer: %s' + err });
        });

        // wait for the ready event before producing
        producer.on('ready', function(arg) {
            logger.debug({ event: 'producer ready' + arg });
        });

        // log delivery reports
        producer.on('delivery-report', function(err, dr) {
            if (err) {
                logger.error({ event: 'Delivery failed: %j' + err });
                // consider retrying
            } else {
                logger.debug({ event: 'Delivery success: %j' + dr });
            }
        });

        // starting the producer
        producer.connect();

        return producer;
    }


    _ConnectConsumer(topicsArray) {
        try {
            // let consumerConfig = config.kafkaBroker.consumerConfig;
            // if (CONSUMER_GROUP_ID) {
            //     consumerConfig.group_id = CONSUMER_GROUP_ID;
            // }
            const consumer = new Kafka.KafkaConsumer({
                "debug":config.kafkaBroker.consumerConfig.debug,
                "client.id": os.hostname(),
                "group.id": CONSUMER_GROUP_ID,
                "metadata.broker.list": config.kafkaBroker.consumerConfig.metadata_broker_list,
                "security.protocol": config.kafkaBroker.consumerConfig.security_protocol,
                "sasl.mechanisms": config.kafkaBroker.consumerConfig.sasl_mechanisms,
                "ssl.ca.location": config.kafkaBroker.consumerConfig.ssl_ca_location,
                "sasl.username": config.kafkaBroker.consumerConfig.sasl_username,
                "sasl.password": config.kafkaBroker.consumerConfig.sasl_password,
                "enable.ssl.certificate.verification": false,
                "enable.auto.commit": true,
                "broker.version.fallback": config.kafkaBroker.consumerConfig.broker_version_fallback,  // still needed with librdkafka 0.11.5
                "log.connection.close" : false,
              },{"auto.offset.reset": config.kafkaBroker.consumerConfig.auto_offset_reset});
            logger.debug(topicsArray);
            logger.debug({ topicsArray });

            // logging all errors
            consumer.on('event.error', function(err) {
                logger.error({
                    event: 'Error thrown',
                    functionName: "_ConnectConsumer in broker",
                    error: err
                });
            });

            // counter to commit offsets every numMessages are received
            var counter = 0;
            var numMessages = config.kafkaBroker.numMessages;

            consumer.on('ready', function(arg) {
                logger.debug({ event: `consumer ready`, arg });

                // consumer.subscribe(topicsArray);
                for(let i=0;i<topicsArray.length;i++)
                {
                    let topic = [topicsArray[i]];
                    console.log(`Subscribing to topic ${topicsArray[i]}`)
                    consumer.subscribe(topic);
                    let subscribedTopics = consumer.subscription();
                    console.log(`Total subscribed topics thus far are : ${subscribedTopics.length}`)
                    logger.info(subscribedTopics);
                    if(subscribedTopics.length >= 2)
                    {
                        console.log(`Thats my limit i won't subscribe more than 2 topics`)
                        console.log(subscribedTopics)
                        break;
                    }
                }
                // start consuming messages
                setInterval(function() {
                   consumer.consume(1);
                 }, CONSUME_INTERVAL);
                
                //consumer.consume(); disabling flowing mode, go for non-flowing mode instead
            });

            /*consumer.on('data', function (m) {
			  counter++;
		
			  // committing offsets every numMessages
			  if (counter % numMessages === 0) {
				logger.debug('calling commit');
				consumer.commit(m);
			  }
		
			  // convert value to JSON (if it is) before logging
			  try {
				m.value = JSON.parse(m.value.toString());
			  } catch {}
		
			  // convert key to string before logging
			  if (m.key) m.key = m.key.toString();
		
			  // Output the actual message contents
			  logger.debug('data received value');
			  logger.debug(' value is ' + m.value);
			  logger.debug(' Printing topic Name' + m.topic);
		
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

        consumer.on('data', function(msg) {

            // // committing offsets every numMessages
            // if (counter % numMessages === 0) {
            //   consumer.commit(msg);
            // }
            logger.debug({ msg });
            func(msg);
        });


    }

    produceMessage(msg, topicName) {

        logger.debug({ event: " About to produce message", function: "produceMessage in Broker" });
        // if partition is set to -1, librdkafka will use the default partitioner
        const partition = -1;
        const value = Buffer.from(JSON.stringify(msg));
        logger.debug({ value });

        try {
            this.producer.on('ready', (arg) => {
                this.producer.produce(topicName, partition, value);
                logger.debug({ event: `producer ready ${arg}` });
            });


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