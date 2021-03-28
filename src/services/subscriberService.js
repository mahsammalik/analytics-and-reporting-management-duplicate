import { logger, Broker } from '/util/';
import { accountStatementService, taxStatementService } from '/services/';
import DB2Connection from '../util/DB2Connection';
import dataMapping from './helpers/dataMapping';
import {sendMonyToBankProcessor, qrPaymentProcessor, mobileBundleProcessor, donationProcessor, 
busTicketProcessor, eventTicketProcessor, depositVIADebitCardProcessor, darazVoucherProcessor,
eVoucherProcessor, accountDetailsUpdateProcessor, requestToPayProcessor} from '/consumers/'

//let instance = null;

class Subscriber {
    
    constructor() {
        // if (!instance) {
        //     instance = this;
             this.event = new Broker([
                config.kafkaBroker.topics.Init_topic,
                config.kafkaBroker.topics.App_Merchant_Account_Statement,
                config.kafkaBroker.topics.InitTrans_IBFT_Incoming,
                config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming,
                config.kafkaBroker.topics.InitTrans_IBFT_Incoming_Fail,
                config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming_Fail,
    
                config.kafkaBroker.topics.initTrans_sendMoney_bank,
                config.kafkaBroker.topics.initTrans_qr_payment,
                config.kafkaBroker.topics.confirmTrans_qr_payment,
                config.kafkaBroker.topics.initTrans_MobileBundle,
                config.kafkaBroker.topics.confirmTrans_MobileBundle,
                config.kafkaBroker.topics.initTrans_BusTicket,
                config.kafkaBroker.topics.confirmTrans_BusTicket,
                config.kafkaBroker.topics.initTrans_eVouchers,
                config.kafkaBroker.topics.confirmTrans_eVouchers,
                config.kafkaBroker.topics.initTrans_eventTickets,
                config.kafkaBroker.topics.confirmTrans_eventTickets,
                config.kafkaBroker.topics.queryTrans_creemVoucher,
                config.kafkaBroker.topics.initTrans_Donation,
                config.kafkaBroker.topics.confirmTrans_Donation,
                config.kafkaBroker.topics.intTrans_customerDeposit_DVDC,
                config.kafkaBroker.topics.confirm_deposit_DVDC,
                config.kafkaBroker.topics.init_daraz_voucher,
                config.kafkaBroker.topics.confirm_daraz_voucher,
                config.kafkaBroker.topics.update_account_details,
                config.kafkaBroker.topics.initTrans_mr_payment,
                config.kafkaBroker.topics.confirmTrans_mr_payment
             ]);    
            //this.setConsumer();
            //return instance;
        
        
        //provide list of topics from which you want to consume messages

        
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
        logger.debug("SET COnsumer Called")
        this.event.addConsumerOnDataEvent(async function (msg) {
            try {
                logger.info({ event: 'Entered function', functionName: `setConsumer in class subscriber ${msg.topic}` });
                logger.debug(`============PROCESSING MESSAGE FROM KAFKA TOPIC ${msg.topic}======================`)

                if (msg.topic === config.kafkaBroker.topics.Init_auditLog) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                }
                if (msg.topic === config.kafkaBroker.topics.App_Merchant_Account_Statement) {
                    logger.info({ event: 'Consume Topic', value: JSON.parse(msg.value) });
                    const payload = JSON.parse(msg.value);
                    logger.debug(JSON.stringify(payload));
                    const accountStatement = new accountStatementService();
                    if (payload.format === 'pdf')
                        { await accountStatement.sendEmailPDFFormat(payload) }
                    else
                    {   logger.debug(`===SENDIN ACCOUNT STATEMENT CSV==============`)
                        await accountStatement.sendEmailCSVFormat(payload);
                    }
                }

                if (msg.topic === config.kafkaBroker.topics.InitTrans_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Init Trans Outgoing USSD Payment Kafka *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));

                        let db2Response = dataMapping.getIBFTOutgoingInitMapping(payload);
                        logger.debug('Mapped Response for DB2');
                        logger.debug(db2Response);

                        if (db2Response != null) {
                            const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                            logger.debug(response);
                        }

                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'InitTrans_USSD_Outgoing in class excelExportController', 'error': { message: error.message, stack: error.stack } });
                        logger.info({ event: 'Exited function', functionName: 'InitTrans_USSD_Outgoing in class excelExportController' });
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Confirm Outgoing USSD Payment Kafka *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));

                        if (payload.CustomObject) {
                            logger.debug('Custom Object exists')
                            logger.debug(JSON.stringify(payload));

                            let db2Response = dataMapping.getIBFTOutgoingConfirmMapping(payload);
                            logger.debug('Mapped Response for DB2');
                            logger.debug(db2Response);

                            if (db2Response != null) {
                                const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                                logger.debug(response);
                            }
                        } else {
                            // logger.debug('Custom Object doesnt exists')
                            logger.debug('Custom Object doesnt exists: ',JSON.stringify(payload));
                        }
                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'ConfirmTrans_USSD_Outgoing in class excelExportController' });
                        logger.info({ event: 'Exited function', functionName: 'ConfirmTrans_USSD_Outgoing in class excelExportController' });
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_IBFT_Incoming) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Init Trans Incoming IBFT Kafka Consumer *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));

                        let db2MappingResponse = dataMapping.getIBFTIncomingInitMapping(payload);
                        logger.debug('Mapped Response for DB2');
                        logger.debug(db2MappingResponse);

                        if (db2MappingResponse != null) {
                            const DB2InsertResponse = await DB2Connection.addIncomingTransaction(db2MappingResponse.initTransData);
                            logger.debug({ DB2InsertResponse });
                        }

                    } catch (error) {
                        logger.error({ event: 'Error thrown', functionName: 'InitTrans_IBFT_Incoming in class excelExportController' });
                        logger.info({ event: 'Exited function', functionName: 'InitTrans_IBFT_Incoming in class excelExportController' });
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Confirm Trans Incoming IBFT Kafka Payment Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));

                        let db2MappingResponse = dataMapping.getIBFTIncomingConfirmMapping(payload);
                        logger.debug('Mapped Response for DB2');
                        logger.debug(db2MappingResponse);

                        if (db2MappingResponse != null) {
                            const DB2InsertResponse = await DB2Connection.updateIncomingTransaction(db2MappingResponse.confirmTransData);
                            logger.debug({ DB2InsertResponse });
                        }

                    } catch (error) {
                        logger.debug(error);
                    }
                }

                // failure events
                if (msg.topic === config.kafkaBroker.topics.InitTrans_IBFT_Incoming_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Init Trans Incoming Failed IBFT Kafka Payment Called *****************');

                    try {
                      
                      const payload = JSON.parse(msg.value);
                      logger.debug(JSON.stringify(payload));
                     
                      let db2MappingResponse = dataMapping.getIBFTIncomingInitMapping(payload);
                      logger.debug('Mapped Response for DB2');
                      logger.debug(JSON.stringify(db2MappingResponse));
          
                      if (db2MappingResponse != null) {
                        const DB2InsertResponse = await DB2Connection.addIncomingTransaction(db2MappingResponse.initTransData);
                        logger.debug({DB2InsertResponse});
                      }
          
                    } catch(error){
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Confirm Trans Incoming Failed IBFT Kafka Payment Called *****************');

                    try {
                      
                      const payload = JSON.parse(msg.value);
                      logger.debug(JSON.stringify(payload));
                     
                      let db2MappingResponse = dataMapping.getIBFTIncomingConfirmMapping(payload);
                      logger.debug('Mapped Response for DB2');
                      logger.debug(JSON.stringify(db2MappingResponse));
          
                      if (db2MappingResponse != null) {
                        const DB2InsertResponse = await DB2Connection.updateIncomingTransaction(db2MappingResponse.confirmTransData);
                        logger.debug({DB2InsertResponse});
                      }
          
                    } catch(error){
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Init Trans Outgoing USSD Failed IBFT Kafka Called *****************');

                    try {
                      
                      const payload = JSON.parse(msg.value);
                      logger.debug(JSON.stringify(payload));
                      
                      let db2Response = dataMapping.getIBFTOutgoingInitMapping(payload);
                      logger.debug('Mapped Response for DB2');
                      logger.debug(JSON.stringify(db2Response));
          
                      if (db2Response != null) {
                        const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                        logger.debug(response);  
                      }

                    } catch(error){
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Confirm Trans Outgoing USSD Failed IBFT Kafka Called *****************');

                    try {
                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        if (payload.CustomObject) {
                            logger.debug('Custom Object exists')
                            logger.debug(JSON.stringify(payload));
                        
                            let db2Response = dataMapping.getIBFTOutgoingConfirmMapping(payload);
                            logger.debug('Mapped Response for DB2');
                            logger.debug(JSON.stringify(db2Response));
        
                            if (db2Response != null) {
                                const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                                logger.debug(response);  
                            }
                        } else {
                            logger.debug('Custom Object doesnt exists')
                            logger.debug(JSON.stringify(payload));
                     }
                    } catch(error){
                        logger.debug(error);
                    }
                }

                // events from mobile app
                if (msg.topic === config.kafkaBroker.topics.InitTrans_Mobile_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Init Trans Outgoing Mobile USSD IBFT Kafka Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));

                        let db2Response = dataMapping.getIBFTMobileOutgoingInitMapping(payload);
                        logger.debug('Mapped Response for DB2');
                        logger.debug(db2Response);

                        if (db2Response != null) {
                            const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                            logger.debug(response);
                        }

                    } catch (error) {
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_Mobile_USSD_Outgoing) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Confirm Trans Outgoing Mobile USSD IBFT Kafka Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));

                        //   let db2MappingResponse = dataMapping.getIBFTIncomingConfirmMapping(payload);
                        //   logger.debug('Mapped Response for DB2');
                        //   logger.debug(db2MappingResponse);

                        //   if (db2MappingResponse != null) {
                        //     const DB2InsertResponse = await DB2Connection.updateIncomingTransaction(db2MappingResponse.confirmTransData);
                        //     logger.debug({DB2InsertResponse});
                        //   }

                    } catch (error) {
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_Mobile_SOAP_USSD_Outgoing) {
                    logger.info({ event: 'Confirm Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Init Trans Outgoing SOAP Mobile USSD Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));

                        //   let db2Response = dataMapping.getIBFTMobileOutgoingConfirmMapping(payload);
                        //   logger.debug('Mapped Response for DB2');
                        //   logger.debug(db2Response);

                        //   if (db2Response != null) {
                        //     const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                        //     logger.debug(response);  
                        //   }

                    } catch (error) {
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_Mobile_SOAP_USSD_Outgoing) {
                    logger.info({ event: 'Confirm Topic', value: JSON.parse(msg.value) });
                    logger.debug('*********** Confirm Trans Outgoing SOAP Mobile USSD Called *****************');

                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));

                        let db2Response = dataMapping.getIBFTMobileOutgoingConfirmMapping(payload);
                        logger.debug('Mapped Response for DB2');
                        logger.debug(db2Response);

                        if (db2Response != null) {
                            const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                            logger.debug(response);
                        }

                    } catch (error) {
                        logger.debug(error);
                    }
                }

                // events from mobile app failures
                if (msg.topic === config.kafkaBroker.topics.InitTrans_Mobile_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });                    
                    logger.debug('*********** Init Trans Failed Outgoing Mobile USSD IBFT Kafka Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      logger.debug(JSON.stringify(payload));
                        
                      let db2Response = dataMapping.getIBFTMobileOutgoingInitMapping(payload);
                      logger.debug('Mapped Response for DB2');
                      logger.debug(db2Response);
          
                      if (db2Response != null) {
                        const response = await DB2Connection.addOutgoingTransaction(db2Response.initTransData);
                        logger.debug(response);  
                      }
          
                    } catch(error){
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_Mobile_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Init Topic', value: JSON.parse(msg.value) });                    
                    logger.debug('*********** Confirm Trans Failed Outgoing Mobile USSD IBFT Kafka Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      logger.debug(JSON.stringify(payload));
                     
                    //   let db2MappingResponse = dataMapping.getIBFTIncomingConfirmMapping(payload);
                    //   logger.debug('Mapped Response for DB2');
                    //   logger.debug(db2MappingResponse);
          
                    //   if (db2MappingResponse != null) {
                    //     const DB2InsertResponse = await DB2Connection.updateIncomingTransaction(db2MappingResponse.confirmTransData);
                    //     logger.debug({DB2InsertResponse});
                    //   }
          
                    } catch(error){
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.InitTrans_Mobile_SOAP_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Confirm Topic', value: JSON.parse(msg.value) });                    
                    logger.debug('*********** Init Trans Failed Outgoing SOAP Mobile USSD Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      logger.debug(JSON.stringify(payload));
                       
                    //   let db2Response = dataMapping.getIBFTMobileOutgoingConfirmMapping(payload);
                    //   logger.debug('Mapped Response for DB2');
                    //   logger.debug(db2Response);
    
                    //   if (db2Response != null) {
                    //     const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                    //     logger.debug(response);  
                    //   }
          
                    } catch(error){
                        logger.debug(error);
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.ConfirmTrans_Mobile_SOAP_USSD_Outgoing_Fail) {
                    logger.info({ event: 'Confirm Topic', value: JSON.parse(msg.value) });                    
                    logger.debug('*********** Confirm Trans Failed Outgoing SOAP Mobile USSD Called *****************');
                    
                    try {
                      
                      const payload = JSON.parse(msg.value);
                      logger.debug(JSON.stringify(payload));
                       
                      let db2Response = dataMapping.getIBFTMobileOutgoingConfirmMapping(payload);
                      logger.debug('Mapped Response for DB2');
                      logger.debug(db2Response);
    
                      if (db2Response != null) {
                        const response = await DB2Connection.updateOutgoingTransaction(db2Response.confirmTransData);
                        logger.debug(response);  
                      }
          
                    } catch(error){
                        logger.debug(error);
                    }
                }
   
                // events to store data into for reporting
                if (msg.topic === config.kafkaBroker.topics.initTrans_sendMoney_bank){
                    logger.debug('*********** Init Trans Send Money Bank *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await sendMonyToBankProcessor.processSendMoneyToBankConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_qr_payment){
                    logger.debug('*********** Init Trans QR Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await qrPaymentProcessor.processQRPaymentConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_qr_payment){
                    logger.debug('*********** Confirm QR Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await qrPaymentProcessor.processQRPaymentConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_MobileBundle){
                    logger.debug('*********** Init Trans Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_MobileBundle){
                    logger.debug('*********** Confirm Trans Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await mobileBundleProcessor.mobileBundleConsumerProcessor(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_BusTicket){
                    logger.debug('*********** Init Trans Bus Ticket *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await busTicketProcessor.processBusTicketConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_BusTicket){
                    logger.debug('*********** Confirm Trans Bus Ticket *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await busTicketProcessor.processBusTicketConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_eVouchers){
                    logger.debug('*********** Init Trans eVouchers *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await eVoucherProcessor.processEVouchersConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_eVouchers){
                    logger.debug('*********** Confirm Trans eVouchers *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await eVoucherProcessor.processEVouchersConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_eventTickets){
                    logger.debug('*********** Init Trans Event Tickets *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await eventTicketProcessor.processEventTicketConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_eventTickets){
                    logger.debug('*********** Confirm Trans Event Tickets *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await eventTicketProcessor.processEventTicketConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.queryTrans_creemVoucher){
                    logger.debug('*********** Query Trans Creem Voucher *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        //await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_Donation){
                    logger.debug('*********** Init Trans Donation *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await donationProcessor.processDonationConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_Donation){
                    logger.debug('*********** Confirm Trans Donation *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await donationProcessor.processDonationConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.intTrans_customerDeposit_DVDC){
                    logger.debug('*********** Init Trans Deposit VIA Debit Card *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await depositVIADebitCardProcessor.processDVDCConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirm_deposit_DVDC){
                    logger.debug('*********** Confirm Trans Deposit VIA Debit Card *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await depositVIADebitCardProcessor.processDVDCConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.init_daraz_voucher){
                    logger.debug('*********** Init Trans Daraz Voucher *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await darazVoucherProcessor.processDarazWalletConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirm_daraz_voucher){
                    logger.debug('*********** Confirm Trans Daraz Voucher *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await darazVoucherProcessor.processDarazWalletConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.update_account_details){
                    logger.debug('*********** Update Account Details *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await accountDetailsUpdateProcessor.processUpdateAccountDetailsConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_mr_payment){
                    logger.debug('*********** Init Trans Request2Pay *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await requestToPayProcessor.processRequestToPayConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_mr_payment){
                    logger.debug('*********** Confirm Trans Request2Pay *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        logger.debug(JSON.stringify(payload));
                        
                        await requestToPayProcessor.processRequestToPayConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
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
// export default new Subscriber();
