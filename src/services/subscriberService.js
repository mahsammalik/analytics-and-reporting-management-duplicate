import { logger, Broker } from '/util/';
import { accountStatementService, taxStatementService } from '/services/';
class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([config.kafkaBroker.topics.Init_topic, config.kafkaBroker.topics.App_Merchant_Account_Statement]);
    }

    setConsumer() {
        this.event.addConsumerOnDataEvent(async function(msg) {
            try {
                logger.info({ event: 'Entered function', functionName: 'setConsumer in class subscriber' });

                if (msg.topic === config.kafkaBroker.topics.Init_auditLog) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                }
                if (msg.topic === config.kafkaBroker.topics.App_Merchant_Account_Statement) {
                    logger.info({ event: 'Consume Topic', value: JSON.parse(msg.value) });
                    const payload = JSON.parse(msg.value);
                    const accountStatement = new accountStatementService();
                    res.locals.response = payload.format === 'pdf' ? await accountStatement.sendEmailPDFFormat(payload) : await accountStatement.sendEmailCSVFormat(payload);
                }

            } catch (error) {
                logger.error({ event: 'Error thrown ', functionName: 'setConsumer in class subscriber', error });
                throw new Error(error);
            }

        });

    }

}

export default Subscriber;