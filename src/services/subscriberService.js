import { logger, Broker } from '/util/';
import { accountStatementService, taxStatementService } from '/services/';
import DB2Connection from '../util/DB2Connection';
import dataMapping from './helpers/dataMapping';
import {
    sendMonyToBankProcessor, qrPaymentProcessor, mobileBundleProcessor, donationProcessor,
    busTicketProcessor, eventTicketProcessor, depositVIADebitCardProcessor, darazVoucherProcessor,
    eVoucherProcessor, accountDetailsUpdateProcessor, requestToPayProcessor, cardOrderingProcessor,
    newSignupRewardProcessor, foodOrderingProcessor, createCardPINProcessor,
    cardLinkDelinkProcessor, scheduledTransactionsProcessor, accountUpgradeProcessor,
    movieTicketsProcessor, doorstepCashinProcessor, careemVoucherProcessor, payoneerRegProcessor,
    payoneerTransProcessor, displayQRProcessor, onboardingProcessor, inviteAndEarnProcessor,
    fallbackFailureProcessor, consumerOnboardingProcessor, deviceAuthProcessor, walletRequestProcessor,
    blockCardProcessor, insuranceClaimProcessor, payoneerLoginProcessor, cashToGoodProcessor, cashToGoodRedeemProcessor,
    multiPaymentQrPaymentProcessor, cashToGoodRefundProcessor, cashbackRedeemProcessor, gToPCnicProcessor
} from '/consumers/'

const KAFKA_DRAIN_CHECK = process.env.KAFKA_DRAIN_CHECK || "false";
//let instance = null;

class Subscriber {

    constructor() {
        // if (!instance) {
        //     instance = this;

        this.event = new Broker([
            config.kafkaBroker.topics.Init_topic,
            config.kafkaBroker.topics.App_Merchant_Account_Statement,
            // config.kafkaBroker.topics.InitTrans_IBFT_Incoming,
            // config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming,
            // config.kafkaBroker.topics.InitTrans_IBFT_Incoming_Fail,
            // config.kafkaBroker.topics.ConfirmTrans_IBFT_Incoming_Fail,

            //config.kafkaBroker.topics.initTrans_sendMoney_bank,
            config.kafkaBroker.topics.initTrans_qr_payment,
            config.kafkaBroker.topics.confirmTrans_qr_payment,
            config.kafkaBroker.topics.initTrans_MobileBundle,
            config.kafkaBroker.topics.init_refund_Trans_MobileBundle_withoutConfirmB2B,
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
            config.kafkaBroker.topics.confirmTrans_mr_payment,
            config.kafkaBroker.topics.initTrans_cardOrdering,
            config.kafkaBroker.topics.confirmTrans_cardOrdering,
            config.kafkaBroker.topics.initTrans_InsuranceSubPayment,
            config.kafkaBroker.topics.confirmTrans_InsuranceSubPayment,
            // config.kafkaBroker.topics.initTrans_signupReward,
            // config.kafkaBroker.topics.confirmTrans_signupReward,
            config.kafkaBroker.topics.initTrans_foodOrdering,
            config.kafkaBroker.topics.confirmTrans_foodOrdering,
            config.kafkaBroker.topics.updateTrans_cardManagement,
            config.kafkaBroker.topics.initTrans_inviteAndEarn,
            config.kafkaBroker.topics.confirmTrans_inviteAndEarn,
            config.kafkaBroker.topics.SecureCard_CardDelink,
            config.kafkaBroker.topics.SecureCard_CardLink,
            config.kafkaBroker.topics.initTrans_moneyTransfer_B2B,
            config.kafkaBroker.topics.confirmTrans_moneyTransfer_B2B,
            config.kafkaBroker.topics.initTrans_moneyTransfer_C2C,
            config.kafkaBroker.topics.confirmTrans_moneyTransfer_C2C,
            config.kafkaBroker.topics.initTrans_cnicPayment,
            config.kafkaBroker.topics.confirmTrans_cnicPayment,
            config.kafkaBroker.topics.confirmTrans_scheduledTrans,
            config.kafkaBroker.topics.accountUpgrade_success,
            config.kafkaBroker.topics.accountUpgrade_nadraFailure,
            config.kafkaBroker.topics.accountUpgrade_cpsFailure,
            config.kafkaBroker.topics.initTrans_movieTickets,
            config.kafkaBroker.topics.confirmTrans_movieTickets,
            config.kafkaBroker.topics.doorstepCashin_failed,
            config.kafkaBroker.topics.doorstepCashin_passed,
            config.kafkaBroker.topics.intTrans_voucherPayment,
            config.kafkaBroker.topics.confirmTrans_voucherPayment,
            config.kafkaBroker.topics.payoneer_registration,
            config.kafkaBroker.topics.payoneer_transaction,
            config.kafkaBroker.topics.display_QR,
            config.kafkaBroker.topics.merchant_onboarding,
            config.kafkaBroker.topics.fallbackFailure,
            config.kafkaBroker.topics.consumer_onboarding,
            config.kafkaBroker.topics.device_authentication,
            config.kafkaBroker.topics.wallet_request,
            config.kafkaBroker.topics.insurance_claim,

            config.kafkaBroker.topics.cashToGoodConfirm,
            config.kafkaBroker.topics.cashToGoodConfirmRedeem,
            config.kafkaBroker.topics.multipayment_qr_payment_passed,
            config.kafkaBroker.topics.cashToGoodRefund,
            config.kafkaBroker.topics.initTrans_MobileBundleZong,
            config.kafkaBroker.topics.confirmTrans_MobileBundleZong,
            config.kafkaBroker.topics.cashback_reward_init_passed,
            config.kafkaBroker.topics.cashback_reward_init_failed,
            config.kafkaBroker.topics.initTrans_refundMobileBundle,
            config.kafkaBroker.topics.confirmTrans_refundMobileBundle,
            config.kafkaBroker.topics.GTOP_Init_Passed,
            config.kafkaBroker.topics.GTOP_Init_Failed

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
                if (KAFKA_DRAIN_CHECK == "true") {

                    logger.info({ debugMessage: "KAFKA DRAIN CHECK TRUE", topic: msg.topic, msgOffset: msg.offset, partition: msg.partition })
                    return;
                }

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
                    if (payload.format === 'pdf') { await accountStatement.sendEmailPDFFormat(payload) }
                    else {
                        logger.debug(`===SENDIN ACCOUNT STATEMENT CSV==============`)
                        await accountStatement.sendEmailCSVFormat(payload);
                    }
                }






                // failure events





                // events from mobile app





                // events from mobile app failures





                // events to store data into for reporting
                if (msg.topic === config.kafkaBroker.topics.initTrans_sendMoney_bank) {
                    logger.debug('*********** Init Trans Send Money Bank *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await sendMonyToBankProcessor.processSendMoneyToBankConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_qr_payment) {
                    logger.debug('*********** Init Trans QR Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await qrPaymentProcessor.processQRPaymentConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_qr_payment) {
                    logger.debug('*********** Confirm QR Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await qrPaymentProcessor.processQRPaymentConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_MobileBundle) {
                    logger.debug('*********** Init Trans Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.init_refund_Trans_MobileBundle_withoutConfirmB2B) {
                    logger.debug('*********** Init/Refund Trans Mobile Bundle B2B without Confirm *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }

                if (msg.topic === config.kafkaBroker.topics.confirmTrans_MobileBundle) {
                    logger.debug('*********** Confirm Trans Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await mobileBundleProcessor.mobileBundleConsumerProcessor(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_refundMobileBundle) {
                    logger.debug('*********** Init Trans Refund Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await mobileBundleProcessor.mobileBundleConsumerProcessorRefund(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_refundMobileBundle) {
                    logger.debug('*********** Confirm Trans Refund Mobile Bundle *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await mobileBundleProcessor.mobileBundleConsumerProcessorRefund(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_MobileBundleZong){
                    logger.debug('*********** Init Trans Mobile Bundle Zong*****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));
                        
                        await mobileBundleProcessor.mobileBundleConsumerProcessorZong(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_MobileBundleZong){
                    logger.debug('*********** Confirm Trans Mobile Bundle Zong*****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));
                        
                        await mobileBundleProcessor.mobileBundleConsumerProcessorZong(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_BusTicket){
                    logger.debug('*********** Init Trans Bus Ticket *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await busTicketProcessor.processBusTicketConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_BusTicket) {
                    logger.debug('*********** Confirm Trans Bus Ticket *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await busTicketProcessor.processBusTicketConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_eVouchers) {
                    logger.debug('*********** Init Trans eVouchers *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await eVoucherProcessor.processEVouchersConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_eVouchers) {
                    logger.debug('*********** Confirm Trans eVouchers *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await eVoucherProcessor.processEVouchersConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_eventTickets) {
                    logger.debug('*********** Init Trans Event Tickets *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await eventTicketProcessor.processEventTicketConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_eventTickets) {
                    logger.debug('*********** Confirm Trans Event Tickets *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await eventTicketProcessor.processEventTicketConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.queryTrans_creemVoucher) {
                    logger.debug('*********** Query Trans Creem Voucher *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        //await mobileBundleProcessor.mobileBundleConsumerProcessor(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_Donation) {
                    logger.debug('*********** Init Trans Donation *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await donationProcessor.processDonationConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_Donation) {
                    logger.debug('*********** Confirm Trans Donation *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await donationProcessor.processDonationConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.intTrans_customerDeposit_DVDC) {
                    logger.debug('*********** Init Trans Deposit VIA Debit Card *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await depositVIADebitCardProcessor.processDVDCConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirm_deposit_DVDC) {
                    logger.debug('*********** Confirm Trans Deposit VIA Debit Card *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await depositVIADebitCardProcessor.processDVDCConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.init_daraz_voucher) {
                    logger.debug('*********** Init Trans Daraz Voucher *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await darazVoucherProcessor.processDarazWalletConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirm_daraz_voucher) {
                    logger.debug('*********** Confirm Trans Daraz Voucher *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await darazVoucherProcessor.processDarazWalletConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.update_account_details) {
                    logger.debug('*********** Update Account Details *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await accountDetailsUpdateProcessor.processUpdateAccountDetailsConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_mr_payment) {
                    logger.debug('*********** Init Trans Request2Pay *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await requestToPayProcessor.processRequestToPayConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_mr_payment) {
                    logger.debug('*********** Confirm Trans Request2Pay *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await requestToPayProcessor.processRequestToPayConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_cardOrdering) {
                    logger.debug('*********** Init Trans Card Ordering *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await cardOrderingProcessor.processCardOrderingConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_cardOrdering) {
                    logger.debug('*********** Confirm Trans Card Ordering *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await cardOrderingProcessor.processCardOrderingConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_InsuranceSubPayment) {
                    logger.debug('*********** Init Trans Insurance Sub. Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        //await cardOrderingProcessor.processCardOrderingConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_InsuranceSubPayment) {
                    logger.debug('*********** Confirm Insurance Sub. Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await cardOrderingProcessor.processCardOrderingConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
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
                if (msg.topic === config.kafkaBroker.topics.initTrans_foodOrdering) {
                    logger.debug('*********** Init Trans Food Ordering *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await foodOrderingProcessor.processFoodOrderingConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_foodOrdering) {
                    logger.debug('*********** Confirm Trans Food Ordering *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await foodOrderingProcessor.processFoodOrderingConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.updateTrans_cardManagement) {
                    logger.debug('*********** Update Trans Card Management *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));
                        logger.info("updateTrans_cardManagement payload parsed : ", JSON.stringify(payload))
                        if (payload?.Request?.Transaction?.CommandID == 'BlockCard' || payload?.Header?.UseCase == 'blockVisaCard') {
                            logger.info("calling blockCardProcessor.processBlockCardConsumer")
                            await blockCardProcessor.processBlockCardConsumer(payload);
                        }
                        else if (payload?.Request?.Trnasaction?.CommandID == 'GenerateCardPIN' || payload?.Header?.UseCase == 'createVisaCardPin') {
                            logger.info('calling createCardPINProcessor.processCreateCardPINConsumer')
                            await createCardPINProcessor.processCreateCardPINConsumer(payload);
                        }
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_inviteAndEarn) {
                    logger.debug('*********** Init Trans Invite&Earn *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await inviteAndEarnProcessor.processInviteAndEarnConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_inviteAndEarn) {
                    logger.debug('*********** Confirm Trans Invite&Earn *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await inviteAndEarnProcessor.processInviteAndEarnConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.SecureCard_CardLink) {
                    logger.debug('*********** Card Link *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));
                        payload.usecase = "cardLink";

                        await cardLinkDelinkProcessor.processCardLinkDelinkConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.SecureCard_CardDelink) {
                    logger.debug('*********** Card Delink *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));
                        payload.usecase = "cardDelink";

                        await cardLinkDelinkProcessor.processCardLinkDelinkConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_moneyTransfer_B2B ||
                    msg.topic === config.kafkaBroker.topics.initTrans_moneyTransfer_C2C ||
                    msg.topic === config.kafkaBroker.topics.initTrans_cnicPayment) {
                    logger.debug('*********** Init Trans Scheduled Transactions *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        if (payload?.CustomObject?.isScheduled == true) {
                            logger.info('Calling scheduledTransactionsProcessor.processScheduledTransactionsConsumer')
                            await scheduledTransactionsProcessor.processScheduledTransactionsConsumer(payload);
                        }
                        else {
                            logger.info('Its not a scheduled transaction, payload: ' + JSON.stringify(payload));
                        }
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_moneyTransfer_B2B ||
                    msg.topic === config.kafkaBroker.topics.confirmTrans_moneyTransfer_C2C ||
                    msg.topic === config.kafkaBroker.topics.confirmTrans_cnicPayment ||
                    msg.topic == config.kafkaBroker.topics.confirmTrans_scheduledTrans) {
                    logger.debug('*********** Confirm Trans Scheduled Transactions *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await scheduledTransactionsProcessor.processScheduledTransactionsConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.accountUpgrade_success) {
                    logger.debug('*********** Account Upgrade Success *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));
                        payload.transType = "UpgradeSuccess";
                        await accountUpgradeProcessor.processAccountUpgradeConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.accountUpgrade_nadraFailure ||
                    msg.topic === config.kafkaBroker.topics.accountUpgrade_cpsFailure) {
                    logger.debug('*********** Account Upgrade Failure *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));
                        payload.transType = "UpgradeFailure";
                        await accountUpgradeProcessor.processAccountUpgradeConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.initTrans_movieTickets) {
                    logger.debug('*********** Init Trans Movie Tickets *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await movieTicketsProcessor.processMovieTicketsConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_movieTickets) {
                    logger.debug('*********** Confirm Trans Movie Tickets *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await movieTicketsProcessor.processMovieTicketsConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.doorstepCashin_passed ||
                    msg.topic === config.kafkaBroker.topics.doorstepCashin_failed) {
                    logger.debug('*********** Doorstep Cashin *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await doorstepCashinProcessor.processDoorstepCashinConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.intTrans_voucherPayment) {
                    logger.debug('*********** Init Trans Voucher Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await careemVoucherProcessor.processCareemVoucherConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.confirmTrans_voucherPayment) {
                    logger.debug('*********** Confirm Trans Voucher Payment *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await careemVoucherProcessor.processCareemVoucherConsumer(payload, true);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.payoneer_registration) {
                    logger.debug('*********** Payoneer Registration *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await payoneerRegProcessor.processPayoneerRegConsumer(payload);
                        // call login process for login report
                        await payoneerLoginProcessor.processPayoneerLoginConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.payoneer_transaction) {
                    logger.debug('*********** Payoneer Transaction *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await payoneerTransProcessor.processPayoneerTransConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.display_QR) {
                    logger.debug('*********** Display QR *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await displayQRProcessor.processDisplayQRConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.merchant_onboarding) {
                    logger.debug('*********** Merchant Onboarding *****************');
                    try {
                        logger.info(`Found Onboarding record printing message value`)
                        //logger.debug(msg)
                        logger.debug(msg.value)
                        logger.debug('About to JSON.parse(msg.value)')
                        let payload = null;
                        try {
                            payload = JSON.parse(msg.value);
                        }
                        catch (jsonParsingError) {
                            if (jsonParsingError.message.includes(`Unexpected token e in JSON at position`)) {
                                logger.error('This is not a valid JSON hence skipping');
                                return;
                            }
                        }
                        logger.debug('Done parsing')
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug('Calling process onboarding consumer with payload ' + JSON.stringify(payload));
                        await onboardingProcessor.processOnboardingConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.fallbackFailure) {
                    logger.debug('*********** Fallback Failure *****************');
                    try {
                        let payload = null;
                        try {
                            payload = JSON.parse(msg.value);
                        }
                        catch (jsonParsingError) {
                            if (jsonParsingError.message.includes(`Unexpected token`)) {
                                logger.error('This is not a valid JSON hence skipping');
                                return;
                            }
                        }
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug('Calling process fallbackFailure consumer with payload ' + JSON.stringify(payload));
                        await fallbackFailureProcessor.processFallbackFailureConsumer(payload);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.consumer_onboarding) {
                    logger.debug('*********** Consumer Onboarding *****************');
                    try {
                        let payload = null;
                        try {
                            payload = JSON.parse(msg.value);
                        }
                        catch (jsonParsingError) {
                            if (jsonParsingError.message.includes(`Unexpected token`)) {
                                logger.error('This is not a valid JSON hence skipping');
                                return;
                            }
                        }
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug('Calling process consumerOnboarding consumer with payload ' + JSON.stringify(payload));
                        await consumerOnboardingProcessor.processConsumerOnboarding(payload);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.device_authentication) {
                    logger.debug('*********** Device Authentication *****************');
                    try {
                        let payload = null;
                        try {
                            payload = JSON.parse(msg.value);
                        }
                        catch (jsonParsingError) {
                            if (jsonParsingError.message.includes(`Unexpected token`)) {
                                logger.error('This is not a valid JSON hence skipping');
                                return;
                            }
                        }
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug('Calling process deviceAuth consumer with payload ' + JSON.stringify(payload));
                        await deviceAuthProcessor.processDeviceAuthConsumer(payload);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.wallet_request) {
                    logger.debug('*********** Wallet Request *****************');
                    try {
                        let payload = null;
                        try {
                            payload = JSON.parse(msg.value);
                        }
                        catch (jsonParsingError) {
                            if (jsonParsingError.message.includes(`Unexpected token`)) {
                                logger.error('This is not a valid JSON hence skipping');
                                return;
                            }
                        }
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug('Calling process walletRequset consumer with payload ' + JSON.stringify(payload));
                        await walletRequestProcessor.processWalletRequestConsumer(payload);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.insurance_claim) {
                    logger.debug('*********** Insurance Claim *****************');
                    try {
                        let payload = null;
                        try {
                            payload = JSON.parse(msg.value);
                        }
                        catch (jsonParsingError) {
                            if (jsonParsingError.message.includes(`Unexpected token`)) {
                                logger.error('This is not a valid JSON hence skipping');
                                return;
                            }
                        }
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug('Calling process insuranceClaim consumer with payload ' + JSON.stringify(payload));
                        await insuranceClaimProcessor.processInsuranceClaimConsumer(payload);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.cashToGoodConfirm) {

                    let payload = null;

                    try {

                        payload = JSON.parse(msg.value);

                    }
                    catch (jsonParsingError) {

                        if (jsonParsingError.message.includes(`Unexpected token`)) {
                            logger.error('This is not a valid JSON hence skipping');
                            return;
                        }
                    }

                    payload.topic = msg.topic;
                    payload.msg_offset = msg.offset;

                    logger.info('Calling process cashToGood consumer with payload ' + JSON.stringify(payload));
                    await cashToGoodProcessor.processCashToGoodConsumer(payload);

                }
                if (msg.topic === config.kafkaBroker.topics.cashToGoodConfirmRedeem) {

                    let payload = null;

                    try {

                        payload = JSON.parse(msg.value);

                    }
                    catch (jsonParsingError) {

                        if (jsonParsingError.message.includes(`Unexpected token`)) {
                            logger.error('This is not a valid JSON hence skipping');
                            return;
                        }
                    }

                    payload.topic = msg.topic;
                    payload.msg_offset = msg.offset;

                    logger.info('Calling process cashToGood redeem consumer with payload ' + JSON.stringify(payload));
                    await cashToGoodRedeemProcessor.processCashToGoodRedeemConsumer(payload);

                }
                if (msg.topic === config.kafkaBroker.topics.multipayment_qr_payment_passed) {

                    let payload = null;

                    try {

                        payload = JSON.parse(msg.value);

                    }
                    catch (jsonParsingError) {

                        if (jsonParsingError.message.includes(`Unexpected token`)) {
                            logger.error('This is not a valid JSON hence skipping');
                            return;
                        }
                    }

                    payload.topic = msg.topic;
                    payload.msg_offset = msg.offset;

                    logger.info('Calling process multipayment_qr_payment_passed consumer with payload ' + JSON.stringify(payload));
                    await multiPaymentQrPaymentProcessor.processMultiPaymentQrPaymentConsumer(payload);

                }
                if (msg.topic === config.kafkaBroker.topics.cashToGoodRefund) {

                    let payload = null;

                    try {

                        payload = JSON.parse(msg.value);

                    }
                    catch (jsonParsingError) {

                        if (jsonParsingError.message.includes(`Unexpected token`)) {
                            logger.error('This is not a valid JSON hence skipping');
                            return;
                        }
                    }

                    payload.topic = msg.topic;
                    payload.msg_offset = msg.offset;

                    logger.info('Calling process cashToGoodRefund consumer with payload ' + JSON.stringify(payload));
                    await cashToGoodRefundProcessor.processCashToGoodRefundConsumer(payload);

                }
                if (msg.topic === config.kafkaBroker.topics.cashback_reward_init_passed) {
                    logger.debug('*********** REDEEM CASHBACK INIT PASSED *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await cashbackRedeemProcessor.processCashbackRedeemConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if (msg.topic === config.kafkaBroker.topics.cashback_reward_init_failed) {
                    logger.debug('*********** REDEEM CASHBACK INIT FAILED *****************');
                    try {

                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        payload.isFailedTrans = true;
                        logger.debug(JSON.stringify(payload));

                        await cashbackRedeemProcessor.processCashbackRedeemConsumer(payload);
                        //logger.debug(response);
                    } catch (error) {
                        logger.debug(error)
                    }
                }
                if(msg.topic === config.kafkaBroker.topics.GTOP_Init_Passed){
                    try{
                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await gToPCnicProcessor.processGtoPCnicTransferConsumer(payload);
                    }
                    catch(error){
                        logger.debug(error);
                    }
                }
                if(msg.topic === config.kafkaBroker.topics.GTOP_Init_Failed){
                    try{
                        const payload = JSON.parse(msg.value);
                        payload.topic = msg.topic;
                        payload.msg_offset = msg.offset;
                        logger.debug(JSON.stringify(payload));

                        await gToPCnicProcessor.processGtoPCnicTransferFailureConsumer(payload);
                    }
                    catch(error){
                        logger.debug(error);
                    }
                }
                // if (msg.topic === config.kafkaBroker.topics.cashback_reward_init_soap_passed) {
                //     logger.debug('*********** REDEEM CASHBACK INIT SOAP PASSED *****************');
                //     try {

                //         const payload = JSON.parse(msg.value);
                //         payload.topic = msg.topic;
                //         payload.msg_offset = msg.offset;
                //         logger.debug(JSON.stringify(payload));

                //         await cashbackRedeemProcessor.processCashbackRedeemConsumer(payload);
                //         //logger.debug(response);
                //     } catch (error) {
                //         logger.debug(error)
                //     }
                // }
                // if (msg.topic === config.kafkaBroker.topics.cashback_reward_init_soap_failed) {
                //     logger.debug('*********** REDEEM CASHBACK INIT SOAP FAILED *****************');
                //     try {

                //         const payload = JSON.parse(msg.value);
                //         payload.topic = msg.topic;
                //         payload.msg_offset = msg.offset;
                //         logger.debug(JSON.stringify(payload));

                //         await cashbackRedeemProcessor.processCashbackRedeemConsumer(payload);
                //         //logger.debug(response);
                //     } catch (error) {
                //         logger.debug(error)
                //     }
                // }
            } catch (error) {
                logger.error({ event: 'Error thrown ', functionName: 'setConsumer in class subscriber', error });
                throw new Error(error);
            }
        });
    }


}

export default Subscriber;
// export default new Subscriber();
