import { logger, Broker } from '/util/';
import { accountStatementService, taxStatementService } from '/services/';
import DB2Connection from '../util/DB2Connection';
import dataMapping from './helpers/dataMapping';

class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([
            config.kafkaBroker.topics.Init_topic, 
            config.kafkaBroker.topics.App_Merchant_Account_Statement,
            config.kafkaBroker.topics.InitTrans_IBFT_Incoming,
            config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming,
            config.kafkaBroker.topics.InitTrans_USSD_Outgoing,
            config.kafkaBroker.topics.ConfirmTrans_USSD_Outgoing
        ]);
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
                if (msg.topic === config.kafkaBroker.topics.InitTrans_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Init Trans Outgoing USSD Payment Kafka *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      
                      let db2Response = dataMapping.getIBFTOutgoingInitMapping(payload);
                      console.log('Mapped Response for DB2');
                      logger.debug(db2Response);
          
                      // if (db2Response!= null) {
                      //   const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                      //   console.log(response);  
                      // }
          
                    } catch(error){
                      logger.debug({ event: 'Error'}, error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Confirm Outgoing USSD Payment Kafka *****************');
                    
                    try {
                      
                        const payload = JSON.parse(msg.value);

                        if (payload.CustomObject) {
                            console.log('Custom Object exists')
                            let db2Response = dataMapping.getIBFTOutgoingConfirmMapping(payload);
                            console.log('Mapped Response for DB2');
                            logger.debug(db2Response);
          
                            // if (db2Response!= null) {
                            //   const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                            //   console.log(response);  
                            // }
                        } else {
                            console.log('Custom Object doesnt exists')
                        }
                    } catch(error){
                        logger.debug({ event: 'Error'}, error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_IBFT_Incoming) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });                    
                    console.log('*********** Init Trans Incoming IBFT Kafka Consumer *****************');
                    
                    try {
                      
                    //   const payload = JSON.parse(msg.value);
                     
                    //   let db2MappingResponse = dataMapping.getIBFTIncomingConfirmDB2Mapping(payload);
                    //   console.log('Mapped Response for DB2');
                    //   console.log(db2MappingResponse);
          
                    //   if (db2MappingResponse != null) {
                    //     const DB2InsertResponse = await DB2Connection.addIncomingTransaction(db2MappingResponse.confirmTransData);
                    //     console.log({DB2InsertResponse});
                    //   }
          
                    } catch(error){
                        logger.debug({ event: 'Error'}, error);
                    }
                }        
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });                    
                    console.log('*********** Confirm Trans Incoming IBFT Kafka Payment Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                     
                      let db2MappingResponse = dataMapping.getIBFTIncomingConfirmDB2Mapping(payload);
                      console.log('Mapped Response for DB2');
                      console.log(db2MappingResponse);
          
                    //   if (db2MappingResponse != null) {
                    //     const DB2InsertResponse = await DB2Connection.addIncomingTransaction(db2MappingResponse.confirmTransData);
                    //     console.log({DB2InsertResponse});
                    //   }
          
                    } catch(error){
                        logger.debug({ event: 'Error'}, error);
                    }
                }

            } catch (error) {
                logger.error({ event: 'Error thrown ', functionName: 'setConsumer in class subscriber', error });
                throw new Error(error);
            }

        });

    }

}

export default Subscriber;