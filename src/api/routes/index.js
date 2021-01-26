import { accountStatementController } from '../controllers/';
import taxStatementController from '../controllers/taxStatementController';
import excelExportController from '../controllers/excelExportController';

import { msisdnParserMW, responseCodeMW, requestLoggerMW } from '../middlewares';
import express from 'express';
import DB2Connection from '../../util/DB2Connection'
import moment  from 'moment';
import {sendMonyToBankProcessor, qrPaymentProcessor, mobileBundleProcessor, donationProcessor,
busTicketProcessor, eventTicketProcessor, darazVoucherProcessor, eVoucherProcessor, depositVIADebitCardProcessor,
accountDetailsUpdateProcessor, requestToPayProcessor} from '/consumers/'

const router = express.Router();
const accountStatement = new accountStatementController();

/**
 * Use this end point to test insert reporting data into DB
 */
// router.get('/insert', async (req, res, next) => {
//     let data = {};
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"IBFT","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923328721082"}},"AppConnectUUID":"803a5648-4f65-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_OFTCreditOTC","OriginatorConversationID":"e5cf4656T1609858286285","Parameters":{"Parameter":[{"Key":"Amount","Value":"21"},{"Key":"BankAccountNumber","Value":"00020000011005352"},{"Key":"SenderMSISDN","Value":"923328721082"},{"Key":"BankCode","Value":"49"},{"Key":"ReceiverMSISDN","Value":"923335373837"},{"Key":"SenderCNIC","Value":"0000000000000"},{"Key":"ChannelCode","Value":"1030"}]},"ReferenceData":{"ReferenceItem":[{"Key":"PurposeOfRemittance","Value":"Purpose(code=0253, lastModifiedDateTime=null, paymentPurposeEn=Transport Payment, paymentPurposeUr=Transport Payment, purposeChecked=false)"}]},"Timestamp":"20210105145131"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711359905","ResultParameters":{"ResultParameter":[{"Key":"Balance","Value":"9031.00"},{"Key":"TransEndDate","Value":"20210105"},{"Key":"TransEndTime","Value":"195132"},{"Key":"SenderCNIC","Value":"0000000000000"},{"Key":"SenderMSISDN","Value":"923328721082"},{"Key":"ReceiverMSISDN","Value":"923335373837"},{"Key":"Deduction","Value":"21.00"},{"Key":"Amount","Value":"21.00"},{"Key":"BankName","Value":"HBL"},{"Key":"BankAccountNumber","Value":"00020000011005352"},{"Key":"BankAccountTitle","Value":"LINKZEESHANAHMED&ZEESHANAHMEDD"}]}},"CustomObject":{"bankCode":"49","purposeofRemittanceCode":"0253","senderCNIC":"0000000000000"}}
//     // sendMonyToBankProcessor.processSendMoneyToBankConsumer(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"QRPayment","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923328721082"},"ReceiverParty":{"IdentifierType":"1","Identifier":"923361414417"}},"AppConnectUUID":"863490b4-5117-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_MerchantPaymentByCustomer","OriginatorConversationID":"76f021b9T1610044703871","Parameters":{"Parameter":[{"Key":"Amount","Value":"1"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210107183824"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711384825","ResultParameters":{"ResultParameter":[{"Key":"Amount","Value":"1.00"},{"Key":"TransEndDate","Value":"20210107"},{"Key":"TransEndTime","Value":"233824"}]}}};
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"QRPayment","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923462381235"}},"AppConnectUUID":"7fdbd86c-599b-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"4419607cT1610980996167","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711463835"},{"Key":"IsSuccess","Value":"true"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210118144316"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711463835","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210118"},{"Key":"TransEndTime","Value":"194316"},{"Key":"Balance","Value":"82.00"},{"Key":"BeneficiaryName","Value":"IBMTESTER"},{"Key":"Amount","Value":"100.00"}]}},"CustomObject":{"txType":"Closed Loop","paidVia":"Till Number","qrCode":"Till Numbe","senderName":"JazzCash Consumer","merchantName":"Shop","merchantMsisdn":"923445304085","merchantTillID":"00000242"}}
//     // qrPaymentProcessor.processQRPaymentConsumer(data, true);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"MobileBundle","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923000851852"}},"AppConnectUUID":"b30d2910-51b3-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_PrepaidTopup(Jazz)","OriginatorConversationID":"7e7d8c1caaf546628ab74813767e8815","Parameters":{"Parameter":[{"Key":"TargetMSISDN","Value":"03237604448"},{"Key":"Amount","Value":25},{"Key":"ChannelCode","Value":"1030"}]},"ReferenceData":{"ReferenceItem":[{"Key":"bundlePrice","Value":25},{"Key":"bundleId","Value":38},{"Key":"operator","Value":"jazz"},{"Key":"bundleValidity","Value":{"hours":0,"days":1,"weeks":0,"months":0}},{"Key":"bundleName","Value":"Day Bundle"}]},"Timestamp":"20210108131620"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711395908","ResultParameters":{"ResultParameter":[{"Key":"TargetMSISDN","Value":"03237604448"},{"Key":"TransEndDate","Value":"20210108"},{"Key":"TransEndTime","Value":"181620"},{"Key":"Amount","Value":"25.00"},{"Key":"Balance","Value":"33.00"}]}}};
//     // mobileBundleProcessor.mobileBundleConsumerProcessor(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"MobileBundle","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923000851852"}},"AppConnectUUID":"d2da0496-5a61-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"2691e23f06a9450995db6baa109ec7c2","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711472675"},{"Key":"IsSuccess","Value":"true"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210119142255"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711472675","ResultParameters":{"ResultParameter":[{"Key":"TargetMSISDN","Value":"03034447896"},{"Key":"TransEndDate","Value":"20210119"},{"Key":"TransEndTime","Value":"192255"},{"Key":"Amount","Value":"18.00"},{"Key":"Balance","Value":"1753.00"}]}}};
//     // mobileBundleProcessor.mobileBundleConsumerProcessor(data, true);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"Donation","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923328721082"}},"AppConnectUUID":"6799b362-55b5-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_Customer Donation","OriginatorConversationID":"d6860b38T1610552317653","Parameters":{"Parameter":[{"Key":"OrgShortCode","Value":"00180377"},{"Key":"Amount","Value":"10"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210113153837"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711438912","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210113"},{"Key":"TransEndTime","Value":"203837"}]}},"CustomObject":{"orgShortCode":"00180377","orgName":"Edhi","DonationType":""}};
//     // await donationProcessor.processDonationConsumer(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"Payment","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923012004697"}},"AppConnectUUID":"a44f3c3e-5630-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"e43366d6T1610605247315","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711441767"},{"Key":"IsSuccess","Value":"true"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210114062047"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711441767","ResultParameters":{"ResultParameter":[{"Key":"Balance","Value":"10567.00"},{"Key":"TransEndDate","Value":"20210114"},{"Key":"TransEndTime","Value":"112047"},{"Key":"SenderCNIC","Value":"0000000000000"},{"Key":"SenderMSISDN","Value":"923012004697"},{"Key":"ReceiverMSISDN","Value":"923012004697"},{"Key":"Deduction","Value":"12.00"},{"Key":"Amount","Value":"12.00"},{"Key":"BankName","Value":"abc"},{"Key":"BankAccountNumber","Value":"12345678911112"},{"Key":"BankAccountTitle","Value":"ZEESHAN AHMED"}]}}};
//     // await donationProcessor.processDonationConsumer(data, true);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"BusTickets","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923455917646"},"ReceiverParty":{"IdentifierType":4,"Identifier":"00180490"}},"AppConnectUUID":"efe332f0-5652-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_MerchantPaymentByCustomer","OriginatorConversationID":"d853cc1ad50f4ecfb0c5e26b3d7593da","Parameters":{"Parameter":[{"Key":"Amount","Value":"7"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210114102617"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711446195","ResultParameters":{"ResultParameter":[{"Key":"Amount","Value":"7.00"},{"Key":"TransEndDate","Value":"20210114"},{"Key":"TransEndTime","Value":"152617"}]}}}
//     // await busTicketProcessor.processBusTicketConsumer(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"BusTickets","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923361414417"}},"AppConnectUUID":"05a2f95c-5727-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"5b3ae75ee3cb4007a30a363f31c98531","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711455497"},{"Key":"IsSuccess","Value":"true"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210115114427"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711455497","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210115"},{"Key":"TransEndTime","Value":"164427"},{"Key":"Balance","Value":"2644.98"},{"Key":"BeneficiaryName","Value":"ufone"},{"Key":"Amount","Value":"787.00"}]}}}
//     // await busTicketProcessor.processBusTicketConsumer(data, true);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"EventTickets","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923455917646"},"ReceiverParty":{"IdentifierType":4,"Identifier":"00180490"}},"AppConnectUUID":"cc50fd2a-566d-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_MerchantPaymentByCustomer","OriginatorConversationID":"6f5f07d503434fc2804a7ed31754f696","Parameters":{"Parameter":[{"Key":"Amount","Value":"3"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210114133834"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711449159","ResultParameters":{"ResultParameter":[{"Key":"Amount","Value":"3.00"},{"Key":"TransEndDate","Value":"20210114"},{"Key":"TransEndTime","Value":"183834"}]}}};
//     // await eventTicketProcessor.processEventTicketConsumer(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"EventTickets","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923455917646"}},"AppConnectUUID":"71862cce-5566-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"47c007c02d24483f8949617d744dbb79","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711428458"},{"Key":"IsSuccess","Value":"true"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210113061324"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711428458","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210113"},{"Key":"TransEndTime","Value":"111324"},{"Key":"Balance","Value":"5817.84"},{"Key":"BeneficiaryName","Value":"ufone"},{"Key":"Amount","Value":"100.00"}]}}};
//     // await eventTicketProcessor.processEventTicketConsumer(data, true);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"DarazVoucher","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923046664576"},"ReceiverParty":{"IdentifierType":4,"Identifier":"00180490"}},"AppConnectUUID":"29ab1376-5b27-11eb-baf7-0c830a8a0000"},"Request":{"Transaction":{"CommandID":"InitTrans_MerchantPaymentByCustomer","OriginatorConversationID":"981f8eaf6d8e42598daed31b7a7b9be1","Parameters":{"Parameter":[{"Key":"Amount","Value":"200"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210120135532"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711487876","ResultParameters":{"ResultParameter":[{"Key":"Amount","Value":"200.00"},{"Key":"TransEndDate","Value":"20210120"},{"Key":"TransEndTime","Value":"185532"}]}}};
//     // await darazVoucherProcessor.processDarazWalletConsumer(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"DarazVoucher","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923046664576"}},"AppConnectUUID":"b636e194-5b27-11eb-baf7-0c830a8a0000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"af5a6244189c441d88f0c5bbccd9cac5","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711487876"},{"Key":"IsSuccess","Value":"true"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210120135923"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711487876","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210120"},{"Key":"TransEndTime","Value":"185928"},{"Key":"Balance","Value":"19310.91"},{"Key":"BeneficiaryName","Value":"ufone"},{"Key":"Amount","Value":"200.00"}]}}};
//     // await darazVoucherProcessor.processDarazWalletConsumer(data, true);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"VoucherPayment","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923361414417"}},"AppConnectUUID":"17649652-5bdf-11eb-b784-0c8306030000"},"Request":{"Transaction":{"CommandID":"InitTrans_UtilityBillsPayment","OriginatorConversationID":"ae4f31163c9142bdac4b4d5f49bff345","Parameters":{"Parameter":[{"Key":"ConsumerRefNum","Value":"A16174"},{"Key":"CompanyCode","Value":"132"},{"Key":"CustomerMSISDN","Value":"923361414417"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210121115208"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711496304","ResultParameters":{"ResultParameter":[{"Key":"LateAmount","Value":"200.00"},{"Key":"ConsumerRefNum","Value":"A16174"},{"Key":"DueDate","Value":"2021-01-21"},{"Key":"DueAmount","Value":"200.00"},{"Key":"CompanyShortName","Value":"Careem Voucher"},{"Key":"Month","Value":"2021-01"},{"Key":"TransEndTime","Value":"165209"},{"Key":"TransEndDate","Value":"20210121"}]}}};
//     // await eVoucherProcessor.processEVouchersConsumer(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"VoucherPayment","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923046664576"}},"AppConnectUUID":"ba79cfd2-5be5-11eb-b784-0c8306030000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"ec0611351de14b02bc5ef105afdb8723","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711497044"},{"Key":"IsSuccess","Value":"true"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210121123939"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711497044","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210121"},{"Key":"TransEndTime","Value":"173939"},{"Key":"Balance","Value":"19297.91"},{"Key":"BeneficiaryName","Value":"ufone"},{"Key":"Amount","Value":"10.00"}]}}};
//     // await eVoucherProcessor.processEVouchersConsumer(data, true);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"DepositViaDebitCard","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923012009818"}},"AppConnectUUID":"7445e34c-5727-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_CustomerDeposit","OriginatorConversationID":"3c8a4d25a28a42ddbe0c60f6017db674","Parameters":{"Parameter":[{"Key":"Amount","Value":100},{"Key":"CustomerMSISDN","Value":"923160512655"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210115114732"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711455557","ResultParameters":{"ResultParameter":[{"Key":"BeneficiaryName","Value":"Nouraiz Taimour"},{"Key":"TransEndDate","Value":"20210115"},{"Key":"TransEndTime","Value":"164733"}]}},"CustomObject":{"txnRefNo":"W2u3K1sz1qg9Iw"}};
//     // await depositVIADebitCardProcessor.processDVDCConsumer(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"DepositViaDebitCard","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923012009818"}},"AppConnectUUID":"c786a080-5724-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"803ae8c9185445c6b56bacb0eb954128","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711455210"},{"Key":"IsSuccess","Value":true},{"Key":"Amount","Value":500},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210115112824"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711455210","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210115"},{"Key":"TransEndTime","Value":"162824"},{"Key":"BeneficiaryName","Value":"Fahad Hassan"},{"Key":"Amount","Value":"500.00"}]}}};
//     // await depositVIADebitCardProcessor.processDVDCConsumer(data, true);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"resetMPIN","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923231486067"}},"AppConnectUUID":"7f8d011e-5bfe-11eb-b784-0c8306030000"},"Request":{"Transaction":{"CommandID":"ResetCustomerHimselfMPIN","OriginatorConversationID":"469e388de526449e879441a9e8c12566","Parameters":{"Parameter":[{"Key":"CustomerMSISDN","Value":"923231486067"},{"Key":"CustomerCNIC","Value":"3520271727647"},{"Key":"CustomerDateofBirth","Value":"19980101"},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210121153658"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"110711498519","ResultParameters":{"ResultParameter":[{"Key":"Commission","Value":"0.00"},{"Key":"FED","Value":"0.00"},{"Key":"WHT","Value":"0.00"},{"Key":"TransEndTime","Value":"203658"},{"Key":"TransEndDate","Value":"20210121"},{"Key":"Fee","Value":"0.00"}]}}};
//     // await accountDetailsUpdateProcessor.processUpdateAccountDetailsConsumer(data);
//     // data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"changeMPIN","ThirdPartyType":"consumerApp","Identity":{"Caller":{"ThirdPartyID":"ibm_consumer_app"},"Initiator":{"IdentifierType":1,"Identifier":"923231486067"}},"AppConnectUUID":"8dad5cc6-5bfe-11eb-b784-0c8306030000"},"Request":{"Transaction":{"CommandID":"ChangeIdentityMPIN","OriginatorConversationID":"1e2b1fc096f94258a87d1d9f08c3b4a0","Parameters":{"Parameter":[{"Key":"NewPIN","Value":"z0sJpxOKzwg="},{"Key":"ChannelCode","Value":"1031"}]},"Timestamp":"20210121153721"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"110711498520","ResultParameters":{"ResultParameter":[{"Key":"FED","Value":"0.00"},{"Key":"WHT","Value":"0.00"},{"Key":"TransEndTime","Value":"203722"},{"Key":"Commission","Value":"0.00"},{"Key":"Fee","Value":"0.00"},{"Key":"TransEndDate","Value":"20210121"}]}}};
//     // await accountDetailsUpdateProcessor.processUpdateAccountDetailsConsumer(data);
//     data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"Request2Pay","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923051164233"},"ReceiverParty":{"IdentifierType":"1","Identifier":"923433182328"}},"AppConnectUUID":"600633b2-5ef4-11eb-81ce-0c830ae70000"},"Request":{"Transaction":{"CommandID":"InitTrans_MerchantPaymentByCustomer","OriginatorConversationID":"fc70f52aT1611568923747","Parameters":{"Parameter":[{"Key":"Amount","Value":"2"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210125100203"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711523526","ResultParameters":{"ResultParameter":[{"Key":"Amount","Value":"2.00"},{"Key":"TransEndDate","Value":"20210125"},{"Key":"TransEndTime","Value":"150204"}]}}};
//     await requestToPayProcessor.processRequestToPayConsumer(data);
//     data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"Request2Pay","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923051164233"}},"AppConnectUUID":"60b51f6c-5ef4-11eb-81ce-0c830ae70000"},"Request":{"Transaction":{"CommandID":"ComfirmTransaction","OriginatorConversationID":"fd07cf6aT1611568924358","Parameters":{"Parameter":[{"Key":"TransID","Value":"010711523526"},{"Key":"IsSuccess","Value":"true"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210125100204"}},"Result":{"ResultType":"0","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711523526","ResultParameters":{"ResultParameter":[{"Key":"TransEndDate","Value":"20210125"},{"Key":"TransEndTime","Value":"150205"},{"Key":"Balance","Value":"136.16"},{"Key":"BeneficiaryName","Value":"Talia murad"},{"Key":"Amount","Value":"2.00"}]}}};
//     await requestToPayProcessor.processRequestToPayConsumer(data, true);
//     res.status(200).json({message: "Done!"})
// });

router.get(
    '/accountwithKakfa', msisdnParserMW(), accountStatement.calculateAccountStatement, responseCodeMW,
);

router.get(
    '/account', msisdnParserMW(), accountStatement.calculateAccountStatementWithoutKafka, responseCodeMW,
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