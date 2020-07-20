import Kafka from 'node-rdkafka';

const brokers = process.env.KAFKA_BOOTSTRAP_SERVERS || config.brokers.kafkaBroker;


class Broker {
  constructor(topicsArray) {

    logger.info(' Event Stream constructor called');
    logger.info('Kafka features: %s' + Kafka.features);
    logger.info('Kafka brokers: %s' + brokers);
    this.producer = this._ConnectProducer();
    this.consumer = this._ConnectConsumer(topicsArray);
  }


  _ConnectProducer() {
    logger.info('_connectProducer called');

    const brokerConfig = {

      'metadata.broker.list': brokers,

    };

    brokerConfig.dr_msg_cb = true; // Enable delivery reports with message payload
    var producer = new Kafka.Producer(brokerConfig);

    producer.setPollInterval(config.kafkaBroker.pollInterval);

    // only if debug option set in config
    producer.on('event.log', function (msg) {
      logger.debug('debug from producer:' + msg);
    });

    // logging all errors
    producer.on('event.error', function (err) {
      logger.error('error from producer: %s' + err);
    });

    // wait for the ready event before producing
    producer.on('ready', function (arg) {
      logger.info('producer ready' + arg);
    });

    // log delivery reports
    producer.on('delivery-report', function (err, dr) {
      if (err) {
        logger.error('Delivery failed: %j' + err);
        // consider retrying
      } else {
        logger.info('Delivery success: %j' + dr);
      }
    });

    // starting the producer
    producer.connect();

    return producer;
  }


  _ConnectConsumer(topicsArray) {
    const consumer = new Kafka.KafkaConsumer({
      'metadata.broker.list': brokers,
      'group.id': config.kafkaBroker.consumerGroupID,
      'enable.auto.commit': config.kafkaBroker.consumerAutoCommit,
    });


    // logging all errors
    consumer.on('event.error', function (err) {
      logger.error('error from consumer: %s' + err);
    });

    // counter to commit offsets every numMessages are received
    var counter = 0;
    var numMessages = config.kafkaBroker.numMessages;

    consumer.on('ready', function (arg) {
      logger.info('consumer ready' + arg);

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

    consumer.on('data', function (msg) {

      // // committing offsets every numMessages
      // if (counter % numMessages === 0) {
      //   consumer.commit(msg);
      // }
      func(msg);
    });


  }



  produceMessage(msg, topicName) {

    logger.info(" About to produce message");
    // if partition is set to -1, librdkafka will use the default partitioner
    const partition = -1;
    const value = Buffer.from(JSON.stringify(msg));
    logger.info('value ' + value);

    try {
      this.producer.produce(topicName, partition, value);

    } catch (err) {
      logger.error('Production failed: %j' + err);
    }

  }


}

export default Broker;