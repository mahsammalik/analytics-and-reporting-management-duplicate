import { logger, BrokerReward } from '/util/';
import { accountStatementService, taxStatementService } from '/services/';
import DB2Connection from '../util/DB2Connection';
import dataMapping from './helpers/dataMapping';
import {newSignupRewardProcessor} from '/consumers/'

const KAFKA_DRAIN_CHECK = process.env.KAFKA_DRAIN_CHECK || "false";
let instance = null;

class RewardSubscriber {

    constructor() {
        // if (!instance) {
        //     instance = this;

        this.event = new BrokerReward([
            //config.kafkaBroker.topics.initTrans_signupReward,
            //config.kafkaBroker.topics.confirmTrans_signupReward,
        ]);

        //this.setConsumer();
        //return instance;


        //provide list of topics from which you want to consume messages


    }

    setConsumer() {
        logger.debug("setConsumer Called")
        this.event.addConsumerOnDataEvent(async function (msg) {
            try {
                if (KAFKA_DRAIN_CHECK == "true") {

                    logger.info({ debugMessage: "KAFKA DRAIN CHECK TRUE", topic: msg.topic, msgOffset: msg.offset, partition: msg.partition })
                    return;
                }

                logger.info({ event: 'Entered function', functionName: `setConsumer in class RewardSubscriber ${msg.topic}` });
                logger.debug(`============PROCESSING MESSAGE FROM KAFKA TOPIC ${msg.topic}======================`)

                if (msg.topic === config.kafkaBroker.topics.initTrans_signupReward) {
                    logger.debug('*********** Init Trans Signup Reward *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await newSignupRewardProcessor.processNewSignupRewardConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_signupReward) {
                    logger.debug('*********** Confirm Trans Signup Reward *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await newSignupRewardProcessor.processNewSignupRewardConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
            } catch (error) {
                logger.error({ event: 'Error thrown ', functionName: 'setConsumer in class RewardSubscriber', error });
                throw new Error(error);
            }
        });
    }

    static getInstance()
    {
        if(!instance)
        {
            instance = new RewardSubscriber();
        }
        return instance;
    }
}

export default RewardSubscriber;
// export default new Subscriber();
