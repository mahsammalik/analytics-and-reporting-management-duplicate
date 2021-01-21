import { logger, Broker } from '/util/';
import { accountStatementService, taxStatementService } from '/services/';
import DB2Connection from '../util/DB2Connection';
import dataMapping from './helpers/dataMapping';
import {sendMonyToBankProcessor, qrPaymentProcessor, mobileBundleProcessor, COMMON_DONATIONProcessor, 
busTicketProcessor, eventTicketProcessor, depositVIADebitCardProcessor} from '/consumers/'

class Subscriber {

    constructor() {
        //provide list of topics from which you want to consume messages 
        this.event = new Broker([
            config.kafkaBroker.topics.Init_topic,
            config.kafkaBroker.topics.App_Merchant_Account_Statement,
            config.kafkaBroker.topics.InitTrans_IBFT_Incoming,
            config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming,
            config.kafkaBroker.topics.InitTrans_IBFT_Incoming_Fail,
            config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming_Fail,

            config.kafkaBroker.topics.initTrans_sendMoney_bank,
            config.kafkaBroker.topics.initTrans_COMMON_QR_PAYMENT,
            config.kafkaBroker.topics.confirmTrans_COMMON_QR_PAYMENT,
            config.kafkaBroker.topics.initTrans_MobileBundle,
            config.kafkaBroker.topics.confirmTrans_MobileBundle,
            config.kafkaBroker.topics.initTrans_BusTicket,
            config.kafkaBroker.topics.confirmTrans_BusTicket,
            config.kafkaBroker.topics.initTrans_COMMON_EVOUCHERs,
            config.kafkaBroker.topics.confirmTrans_COMMON_EVOUCHERs,
            config.kafkaBroker.topics.initTrans_eventTickets,
            config.kafkaBroker.topics.confirmTrans_eventTickets,
            config.kafkaBroker.topics.queryTrans_creemVoucher,
            config.kafkaBroker.topics.initTrans_COMMON_DONATION,
            config.kafkaBroker.topics.confirmTrans_COMMON_DONATION,
            config.kafkaBroker.topics.intTrans_customerDeposit_DVDC,
            config.kafkaBroker.topics.confirm_deposit_DVDC
        ]);
    }

    // config.kafkaBroker.topics.InitTrans_USSD_Outgoing,
    // config.kafkaBroker.topics.ConfirmTrans_USSD_Outgoing,
    // config.kafkaBroker.topics.InitTrans_USSD_Outgoing_Fail,
    // config.kafkaBroker.topics.ConfirmTrans_USSD_Outgoing_Fail,

    // config.kafkaBroker.topics.InitTrans_Mobile_USSD_Outgoing,
    // config.kafkaBroker.topics.ConfirmTrans_Mobile_USSD_Outgoing,
    // config.kafkaBroker.topics.InitTrans_Mobile_SOAP_USSD_Outgoing,
    // config.kafkaBroker.topics.ConfirmTrans_Mobile_SOAP_USSD_Outgoing,

    // config.kafkaBroker.topics.InitTrans_Mobile_USSD_Outgoing_Fail,
    // config.kafkaBroker.topics.ConfirmTrans_Mobile_USSD_Outgoing_Fail,
    // config.kafkaBroker.topics.InitTrans_Mobile_SOAP_USSD_Outgoing_Fail,
    // config.kafkaBroker.topics.ConfirmTrans_Mobile_SOAP_USSD_Outgoing_Fail,

    setConsumer() {
        this.event.addConsumerOnDataEvent(async function (msg) {
            try {
                logger.info({ event: 'Entered function', functionName: `setConsumer in class subscriber ${msg.topic}` });

                if (msg.topic === config.kafkaBroker.topics.Init_auditLog) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                }
                if (msg.topic === config.kafkaBroker.topics.App_Merchant_Account_Statement) {
                    logger.info({ event: 'Consume Topic', value: JSON.parse(msg.value) });
                    const payload = JSON.parse(msg.value);
                    console.log(JSON.stringify(payload));
                    const accountStatement = new accountStatementService();
                    if (payload.format === 'pdf') await accountStatement.sendEmailPDFFormat(payload)
                    else await accountStatement.sendEmailCSVFormat(payload);
                }

                if (msg.topic === config.kafkaBroker.topics.InitTrans_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Init Trans Outgoing USSD Payment Kafka *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));

                        let db2Response = dataMapping.getIBFTOutgoingInitMapping(payload);
                        console.log('Mapped Response for DB2');
                        console.log(db2Response);

                        if (db2Response != null) {
                            const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                            console.log(response);
                        }

                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'InitTrans_USSD_Outgoing in class excelExportController', 'error': { message: error.message, stack: error.stack } });
                        logger.info({ event: 'Exited function', functionName: 'InitTrans_USSD_Outgoing in class excelExportController' });
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Confirm Outgoing USSD Payment Kafka *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));

                        if (payload.CustomObject) {
                            console.log('Custom Object exists')
                            console.log(JSON.stringify(payload));

                            let db2Response = dataMapping.getIBFTOutgoingConfirmMapping(payload);
                            console.log('Mapped Response for DB2');
                            console.log(db2Response);

                            if (db2Response != null) {
                                const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                                console.log(response);
                            }
                        } else {
                            // console.log('Custom Object doesnt exists')
                            console.log('Custom Object doesnt exists: ',JSON.stringify(payload));
                        }
                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'ConfirmTrans_USSD_Outgoing in class excelExportController' });
                        logger.info({ event: 'Exited function', functionName: 'ConfirmTrans_USSD_Outgoing in class excelExportController' });
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_IBFT_Incoming) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Init Trans Incoming IBFT Kafka Consumer *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));

                        let db2MappingResponse = dataMapping.getIBFTIncomingInitMapping(payload);
                        console.log('Mapped Response for DB2');
                        console.log(db2MappingResponse);

                        if (db2MappingResponse != null) {
                            const DB2InsertResponse = await DB2Connection.addIncomingTransaction(db2MappingResponse.initTransData);
                            console.log({ DB2InsertResponse });
                        }

                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'InitTrans_IBFT_Incoming in class excelExportController' });
                        logger.info({ event: 'Exited function', functionName: 'InitTrans_IBFT_Incoming in class excelExportController' });
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Confirm Trans Incoming IBFT Kafka Payment Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));

                        let db2MappingResponse = dataMapping.getIBFTIncomingConfirmMapping(payload);
                        console.log('Mapped Response for DB2');
                        console.log(db2MappingResponse);

                        if (db2MappingResponse != null) {
                            const DB2InsertResponse = await DB2Connection.updateIncomingTransaction(db2MappingResponse.confirmTransData);
                            console.log({ DB2InsertResponse });
                        }

                    } catch (error) {
                        console.log(error);
                    }
                }

                // failure events
                if (msg.topic === config.kafkaBroker.topics.InitTrans_IBFT_Incoming_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Init Trans Incoming Failed IBFT Kafka Payment Called *****************');

                    try {
                      
                      const payload = JSON.parse(msg.value);
                      console.log(JSON.stringify(payload));
                     
                      let db2MappingResponse = dataMapping.getIBFTIncomingInitMapping(payload);
                      console.log('Mapped Response for DB2');
                      console.log(JSON.stringify(db2MappingResponse));
          
                      if (db2MappingResponse != null) {
                        const DB2InsertResponse = await DB2Connection.addIncomingTransaction(db2MappingResponse.initTransData);
                        console.log({DB2InsertResponse});
                      }
          
                    } catch(error){
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Confirm Trans Incoming Failed IBFT Kafka Payment Called *****************');

                    try {
                      
                      const payload = JSON.parse(msg.value);
                      console.log(JSON.stringify(payload));
                     
                      let db2MappingResponse = dataMapping.getIBFTIncomingConfirmMapping(payload);
                      console.log('Mapped Response for DB2');
                      console.log(JSON.stringify(db2MappingResponse));
          
                      if (db2MappingResponse != null) {
                        const DB2InsertResponse = await DB2Connection.updateIncomingTransaction(db2MappingResponse.confirmTransData);
                        console.log({DB2InsertResponse});
                      }
          
                    } catch(error){
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Init Trans Outgoing USSD Failed IBFT Kafka Called *****************');

                    try {
                      
                      const payload = JSON.parse(msg.value);
                      console.log(JSON.stringify(payload));
                      
                      let db2Response = dataMapping.getIBFTOutgoingInitMapping(payload);
                      console.log('Mapped Response for DB2');
                      console.log(JSON.stringify(db2Response));
          
                      if (db2Response != null) {
                        const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                        console.log(response);  
                      }

                    } catch(error){
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Confirm Trans Outgoing USSD Failed IBFT Kafka Called *****************');

                    try {
                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        if (payload.CustomObject) {
                            console.log('Custom Object exists')
                            console.log(JSON.stringify(payload));
                        
                            let db2Response = dataMapping.getIBFTOutgoingConfirmMapping(payload);
                            console.log('Mapped Response for DB2');
                            console.log(JSON.stringify(db2Response));
        
                            if (db2Response != null) {
                                const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                                console.log(response);  
                            }
                        } else {
                            console.log('Custom Object doesnt exists')
                            console.log(JSON.stringify(payload));
                     }
                    } catch(error){
                        console.log(error);
                    }
                }

                // events from mobile app
                if (msg.topic === config.kafkaBroker.topics.InitTrans_Mobile_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Init Trans Outgoing Mobile USSD IBFT Kafka Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));

                        let db2Response = dataMapping.getIBFTMobileOutgoingInitMapping(payload);
                        console.log('Mapped Response for DB2');
                        console.log(db2Response);

                        if (db2Response != null) {
                            const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                            console.log(response);
                        }

                    } catch (error) {
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_Mobile_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Confirm Trans Outgoing Mobile USSD IBFT Kafka Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));

                        //   let db2MappingResponse = dataMapping.getIBFTIncomingConfirmMapping(payload);
                        //   console.log('Mapped Response for DB2');
                        //   console.log(db2MappingResponse);

                        //   if (db2MappingResponse != null) {
                        //     const DB2InsertResponse = await DB2Connection.updateIncomingTransaction(db2MappingResponse.confirmTransData);
                        //     console.log({DB2InsertResponse});
                        //   }

                    } catch (error) {
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_Mobile_SOAP_USSD_Outgoing) {
                    logger.info({ event: 'Confirm Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Init Trans Outgoing SOAP Mobile USSD Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));

                        //   let db2Response = dataMapping.getIBFTMobileOutgoingConfirmMapping(payload);
                        //   console.log('Mapped Response for DB2');
                        //   console.log(db2Response);

                        //   if (db2Response != null) {
                        //     const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                        //     console.log(response);  
                        //   }

                    } catch (error) {
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_Mobile_SOAP_USSD_Outgoing) {
                    logger.info({ event: 'Confirm Topic', value: JSON.parse(msg.value) });
                    console.log('*********** Confirm Trans Outgoing SOAP Mobile USSD Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));

                        let db2Response = dataMapping.getIBFTMobileOutgoingConfirmMapping(payload);
                        console.log('Mapped Response for DB2');
                        console.log(db2Response);

                        if (db2Response != null) {
                            const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                            console.log(response);
                        }

                    } catch (error) {
                        console.log(error);
                    }
                }

                // events from mobile app failures
                if (msg.topic === config.kafkaBroker.topics.InitTrans_Mobile_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });                    
                    console.log('*********** Init Trans Failed Outgoing Mobile USSD IBFT Kafka Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      console.log(JSON.stringify(payload));
                        
                      let db2Response = dataMapping.getIBFTMobileOutgoingInitMapping(payload);
                      console.log('Mapped Response for DB2');
                      console.log(db2Response);
          
                      if (db2Response != null) {
                        const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                        console.log(response);  
                      }
          
                    } catch(error){
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_Mobile_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });                    
                    console.log('*********** Confirm Trans Failed Outgoing Mobile USSD IBFT Kafka Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      console.log(JSON.stringify(payload));
                     
                    //   let db2MappingResponse = dataMapping.getIBFTIncomingConfirmMapping(payload);
                    //   console.log('Mapped Response for DB2');
                    //   console.log(db2MappingResponse);
          
                    //   if (db2MappingResponse != null) {
                    //     const DB2InsertResponse = await DB2Connection.updateIncomingTransaction(db2MappingResponse.confirmTransData);
                    //     console.log({DB2InsertResponse});
                    //   }
          
                    } catch(error){
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_Mobile_SOAP_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Confirm Topic', value: JSON.parse(msg.value) });                    
                    console.log('*********** Init Trans Failed Outgoing SOAP Mobile USSD Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      console.log(JSON.stringify(payload));
                       
                    //   let db2Response = dataMapping.getIBFTMobileOutgoingConfirmMapping(payload);
                    //   console.log('Mapped Response for DB2');
                    //   console.log(db2Response);
    
                    //   if (db2Response != null) {
                    //     const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                    //     console.log(response);  
                    //   }
          
                    } catch(error){
                        console.log(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_Mobile_SOAP_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Confirm Topic', value: JSON.parse(msg.value) });                    
                    console.log('*********** Confirm Trans Failed Outgoing SOAP Mobile USSD Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      console.log(JSON.stringify(payload));
                       
                      let db2Response = dataMapping.getIBFTMobileOutgoingConfirmMapping(payload);
                      console.log('Mapped Response for DB2');
                      console.log(db2Response);
    
                      if (db2Response != null) {
                        const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                        console.log(response);  
                      }
          
                    } catch(error){
                        console.log(error);
                    }
                }
   
                // events to store data into for reporting
                if (msg.topic === config.kafkaBroker.topics.initTrans_sendMoney_bank){
                    console.log('*********** Init Trans Send Money Bank *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await sendMonyToBankProcessor.processSendMoneyToBankConsumer(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_COMMON_QR_PAYMENT){
                    console.log('*********** Init Trans QR Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await qrPaymentProcessor.processQRPaymentConsumer(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_COMMON_QR_PAYMENT){
                    console.log('*********** Confirm QR Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await qrPaymentProcessor.processQRPaymentConsumer(payload, true);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_MobileBundle){
                    console.log('*********** Init Trans Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_MobileBundle){
                    console.log('*********** Confirm Trans Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await mobileBundleProcessor.mobileBundleConsumerProcessor(payload, true);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_BusTicket){
                    console.log('*********** Init Trans Bus Ticket *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await busTicketProcessor.processBusTicketConsumer(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_BusTicket){
                    console.log('*********** Confirm Trans Bus Ticket *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await busTicketProcessor.processBusTicketConsumer(payload, true);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_COMMON_EVOUCHERs){
                    console.log('*********** Init Trans COMMON_EVOUCHERs *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        //await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_COMMON_EVOUCHERs){
                    console.log('*********** Confirm Trans COMMON_EVOUCHERs *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        //await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_eventTickets){
                    console.log('*********** Init Trans Event Tickets *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await eventTicketProcessor.processEventTicketConsumer(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_eventTickets){
                    console.log('*********** Confirm Trans Event Tickets *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await eventTicketProcessor.processEventTicketConsumer(payload, true);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.queryTrans_creemVoucher){
                    console.log('*********** Query Trans Creem Voucher *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        //await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_COMMON_DONATION){
                    console.log('*********** Init Trans COMMON_DONATION *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await COMMON_DONATIONProcessor.processCOMMON_DONATIONConsumer(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_COMMON_DONATION){
                    console.log('*********** Confirm Trans COMMON_DONATION *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await COMMON_DONATIONProcessor.processCOMMON_DONATIONConsumer(payload, true);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.intTrans_customerDeposit_DVDC){
                    console.log('*********** Init Trans Deposit VIA Debit Card *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await depositVIADebitCardProcessor.processDVDCConsumer(payload);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirm_deposit_DVDC){
                    console.log('*********** Confirm Trans Deposit VIA Debit Card *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        console.log(JSON.stringify(payload));
                        
                        await depositVIADebitCardProcessor.processDVDCConsumer(payload, true);
                        //console.log(response);
                    } catch (error) {
                        console.log(error)
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