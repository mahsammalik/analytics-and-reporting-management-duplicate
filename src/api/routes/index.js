import { accountStatementController } from '../controllers/';
import taxStatementController from '../controllers/taxStatementController';
import excelExportController from '../controllers/excelExportController';

import { msisdnParserMW, responseCodeMW, requestLoggerMW } from '../middlewares';
import express from 'express';
import DB2Connection from '../../util/DB2Connection'
import moment  from 'moment';
import {sendMonyToBankProcessor, qrPaymentProcessor, mobileBundleProcessor, donationProcessor,
busTicketProcessor} from '/consumers/'

const router = express.Router();
const accountStatement = new accountStatementController();

/**
 * Use this end point to test insert reporting data into DB
 */
// router.get('/insert', async (req, res, next) => {
//     // const data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"IBFT","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923328721082"}},"AppConnectUUID":"803a5648-4f65-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_OFTCreditOTC","OriginatorConversationID":"e5cf4656T1609858286285","Parameters":{"Parameter":[{"Key":"Amount","Value":"21"},{"Key":"BankAccountNumber","Value":"00020000011005352"},{"Key":"SenderMSISDN","Value":"923328721082"},{"Key":"BankCode","Value":"49"},{"Key":"ReceiverMSISDN","Value":"923335373837"},{"Key":"SenderCNIC","Value":"0000000000000"},{"Key":"ChannelCode","Value":"1030"}]},"ReferenceData":{"ReferenceItem":[{"Key":"PurposeOfRemittance","Value":"Purpose(code=0253, lastModifiedDateTime=null, paymentPurposeEn=Transport Payment, paymentPurposeUr=Transport Payment, purposeChecked=false)"}]},"Timestamp":"20210105145131"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711359905","ResultParameters":{"ResultParameter":[{"Key":"Balance","Value":"9031.00"},{"Key":"TransEndDate","Value":"20210105"},{"Key":"TransEndTime","Value":"195132"},{"Key":"SenderCNIC","Value":"0000000000000"},{"Key":"SenderMSISDN","Value":"923328721082"},{"Key":"ReceiverMSISDN","Value":"923335373837"},{"Key":"Deduction","Value":"21.00"},{"Key":"Amount","Value":"21.00"},{"Key":"BankName","Value":"HBL"},{"Key":"BankAccountNumber","Value":"00020000011005352"},{"Key":"BankAccountTitle","Value":"LINKZEESHANAHMED&ZEESHANAHMEDD"}]}},"CustomObject":{"bankCode":"49","purposeofRemittanceCode":"0253","senderCNIC":"0000000000000"}}
//     // sendMonyToBankProcessor.processSendMoneyToBankConsumer(data);
//     // const data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"QRPayment","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923328721082"},"ReceiverParty":{"IdentifierType":"1","Identifier":"923361414417"}},"AppConnectUUID":"863490b4-5117-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_MerchantPaymentByCustomer","OriginatorConversationID":"76f021b9T1610044703871","Parameters":{"Parameter":[{"Key":"Amount","Value":"1"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210107183824"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711384825","ResultParameters":{"ResultParameter":[{"Key":"Amount","Value":"1.00"},{"Key":"TransEndDate","Value":"20210107"},{"Key":"TransEndTime","Value":"233824"}]}}};
//     // qrPaymentProcessor.processQRPaymentConsumer(data);
//     // const data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"MobileBundle","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923000851852"}},"AppConnectUUID":"b30d2910-51b3-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_PrepaidTopup(Jazz)","OriginatorConversationID":"7e7d8c1caaf546628ab74813767e8815","Parameters":{"Parameter":[{"Key":"TargetMSISDN","Value":"03237604448"},{"Key":"Amount","Value":25},{"Key":"ChannelCode","Value":"1030"}]},"ReferenceData":{"ReferenceItem":[{"Key":"bundlePrice","Value":25},{"Key":"bundleId","Value":38},{"Key":"operator","Value":"jazz"},{"Key":"bundleValidity","Value":{"hours":0,"days":1,"weeks":0,"months":0}},{"Key":"bundleName","Value":"Day Bundle"}]},"Timestamp":"20210108131620"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711395908","ResultParameters":{"ResultParameter":[{"Key":"TargetMSISDN","Value":"03237604448"},{"Key":"TransEndDate","Value":"20210108"},{"Key":"TransEndTime","Value":"181620"},{"Key":"Amount","Value":"25.00"},{"Key":"Balance","Value":"33.00"}]}}};
//     // mobileBundleProcessor.mobileBundleConsumerProcessor(data);
//     // const data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"Donation","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923328721082"}},"AppConnectUUID":"6799b362-55b5-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_Customer Donation","OriginatorConversationID":"d6860b38T1610552317653","Parameters":{"Parameter":[{"Key":"OrgShortCode","Value":"00180377"},{"Key":"Amount","Value":"10"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210113153837"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711438912","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210113"},{"Key":"TransEndTime","Value":"203837"}]}},"CustomObject":{"orgShortCode":"00180377","orgName":"Edhi","donationType":""}};
//     // donationProcessor.processDonationConsumer(data);
//     // const data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"BusTickets","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923455917646"},"ReceiverParty":{"IdentifierType":4,"Identifier":"00180490"}},"AppConnectUUID":"efe332f0-5652-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_MerchantPaymentByCustomer","OriginatorConversationID":"d853cc1ad50f4ecfb0c5e26b3d7593da","Parameters":{"Parameter":[{"Key":"Amount","Value":"7"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210114102617"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711446195","ResultParameters":{"ResultParameter":[{"Key":"Amount","Value":"7.00"},{"Key":"TransEndDate","Value":"20210114"},{"Key":"TransEndTime","Value":"152617"}]}}}
//     // await busTicketProcessor.processBusTicketConsumer(data);
//     res.status(200).json({message: "Done!"})
// });

router.get(
    '/account', msisdnParserMW(), accountStatement.calculateAccountStatement, responseCodeMW,
);
router.get(
    '/tax', msisdnParserMW(), taxStatementController.calculateTaxStatement, responseCodeMW,
);

router.get(
    '/ibft/incoming/:startDate/:endDate', excelExportController.jazzcashIncomingExport
);

router.get(
    '/ibft/outgoing/:startDate/:endDate', excelExportController.jazzcashOutgoingExport
);

export default router;