import Kafka from 'node-rdkafka';
import { logger } from './';

const brokers = process.env.KAFKA_BOOTSTRAP_SERVERS || config.brokers.kafkaBroker;


class Broker {
    constructor(topicsArray) {

        logger.info({ event: ' Event Stream constructor called' });
        logger.info({ event: 'Kafka features: %s' + Kafka.features });
        logger.info({ event: 'Kafka brokers: %s' + brokers });
        this.producer = this._ConnectProducer();
        this.consumer = this._ConnectConsumer(topicsArray);
    }


    _ConnectProducer() {
        logger.info({ event: '_connectProducer called' });
        var brokerConfig = {
            'bootstrap.servers': 'es-1-ibm-es-proxy-route-bootstrap-eventstreams.jazzcash-fra04-b3c-32x128-32e4d82b5ac35ba812aabbeece8661d9-0000.eu-de.containers.appdomain.cloud:443',
            'security.protocol': 'sasl_ssl',
            'sasl.mechanisms': 'PLAIN',
            'ssl.ca.location': '/project/user-app/dist/util/cert.pem',
            'sasl.username': 'Super Key',
            'sasl.password': 'TuR8UGIVVnxNF6EWp7Q2rb_dubYc5AH1MTgUNfOhWcaU',
            'enable.ssl.certificate.verification': false,
            'broker.version.fallback': '0.10.0', // still needed with librdkafka 0.11.5
            'log.connection.close': false,
        };




        brokerConfig.dr_msg_cb = true; // Enable delivery reports with message payload
        var producer = new Kafka.Producer(brokerConfig);

        // starting the producer

        logger.info({ isConnected: producer.isConnected() });
        producer.setPollInterval(config.kafkaBroker.pollInterval);
        producer.connect();
        // wait for the ready event before producing
        // producer.on('ready', function(arg) {
        //     logger.info({ event: 'producer ready', arg });
        // }, (error) => {
        //     logger.error({ event: error });
        // });
        // only if debug option set in config
        producer.on('event.log', function(msg) {
            logger.debug({ event: 'debug from producer:' + msg });
        });

        // logging all errors
        producer.on('event.error', function(err) {
            logger.error({ event: 'error from producer: %s' + err });
        });

        // log delivery reports
        producer.on('delivery-report', function(err, dr) {
            if (err) {
                logger.error({ event: 'Delivery failed', err });
                // consider retrying
            } else {
                logger.info({ event: 'Delivery success', dr });
            }
        });
        producer.on('disconnected', function(arg) {
            logger.info({ event: 'producer disconnected. ' + JSON.stringify(arg) });
        });

        return producer;
    }


    _ConnectConsumer(topicsArray) {
        const consumer = new Kafka.KafkaConsumer({
            "debug": "all",
            'client.id': 'kafka-nodejs-console-sample-consumer',
            'group.id': 'kafka-nodejs-console-sample-group',
            'metadata.broker.list': 'es-1-ibm-es-proxy-route-bootstrap-eventstreams.jazzcash-fra04-b3c-32x128-32e4d82b5ac35ba812aabbeece8661d9-0000.eu-de.containers.appdomain.cloud:443',
            'security.protocol': 'sasl_ssl',
            'sasl.mechanisms': 'PLAIN',
            'ssl.ca.location': '/project/user-app/dist/util/cert.pem',
            'sasl.username': 'Super Key',
            'sasl.password': 'TuR8UGIVVnxNF6EWp7Q2rb_dubYc5AH1MTgUNfOhWcaU',
            'enable.ssl.certificate.verification': false,
            'enable.auto.commit': false,
            'broker.version.fallback': '0.10.2.1', // still needed with librdkafka 0.11.5
            'log.connection.close': false
        });


        // logging all errors
        consumer.on('event.error', function(err) {
            logger.error({ event: 'error from consumer: %s' + err });
        });

        // counter to commit offsets every numMessages are received
        var counter = 0;
        var numMessages = config.kafkaBroker.numMessages;

        consumer.on('ready', function(arg) {
            logger.info({ event: 'consumer ready' + arg });

            consumer.subscribe(topicsArray);
            // start consuming messages
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
            func(msg);
        });


    }



    produceMessage(msg, topicName) {

        // if partition is set to -1, librdkafka will use the default partitioner
        const partition = -1;
        const value = Buffer.from(JSON.stringify(msg));
        logger.info({ event: " About to produce message", value: value });

        try {
            // if (this.producer.isConnected()) {
            this.producer.on('ready', (arg) => {
                logger.info({ event: 'producer ready', arg });
                this.producer.produce(topicName, partition, value);
                // this.producer.disconnect();
            }, (error) => {
                logger.error({ event: 'Error Thrown', error: { message: error.message, stack: error.stack } });
            });

            // } else {
            //     logger.error({ isConnected: this.producer.isConnected() });

            // }

        } catch (err) {
            logger.error({ event: 'Production failed: %j' + err });
            // logger.error({ isCOnnected: this.producer.isConnected() });
        }

    }


}

export default Broker;