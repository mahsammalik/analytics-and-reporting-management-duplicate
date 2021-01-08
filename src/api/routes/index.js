import { accountStatementController } from '../controllers/';
import taxStatementController from '../controllers/taxStatementController';
import excelExportController from '../controllers/excelExportController';

import { msisdnParserMW, responseCodeMW, requestLoggerMW } from '../middlewares';
import express from 'express';
import DB2Connection from '../../util/DB2Connection'
import moment  from 'moment';

const router = express.Router();
const accountStatement = new accountStatementController();

/**
 * Use this end point to test insert reporting data into DB
 */
// router.get('/insert', async (req, res, next) => {
//     //const payload = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"IBFT","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923328721082"}},"AppConnectUUID":"803a5648-4f65-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_OFTCreditOTC","OriginatorConversationID":"e5cf4656T1609858286285","Parameters":{"Parameter":[{"Key":"Amount","Value":"21"},{"Key":"BankAccountNumber","Value":"00020000011005352"},{"Key":"SenderMSISDN","Value":"923328721082"},{"Key":"BankCode","Value":"49"},{"Key":"ReceiverMSISDN","Value":"923335373837"},{"Key":"SenderCNIC","Value":"0000000000000"},{"Key":"ChannelCode","Value":"1030"}]},"ReferenceData":{"ReferenceItem":[{"Key":"PurposeOfRemittance","Value":"Purpose(code=0253, lastModifiedDateTime=null, paymentPurposeEn=Transport Payment, paymentPurposeUr=Transport Payment, purposeChecked=false)"}]},"Timestamp":"20210105145131"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711359905","ResultParameters":{"ResultParameter":[{"Key":"Balance","Value":"9031.00"},{"Key":"TransEndDate","Value":"20210105"},{"Key":"TransEndTime","Value":"195132"},{"Key":"SenderCNIC","Value":"0000000000000"},{"Key":"SenderMSISDN","Value":"923328721082"},{"Key":"ReceiverMSISDN","Value":"923335373837"},{"Key":"Deduction","Value":"21.00"},{"Key":"Amount","Value":"21.00"},{"Key":"BankName","Value":"HBL"},{"Key":"BankAccountNumber","Value":"00020000011005352"},{"Key":"BankAccountTitle","Value":"LINKZEESHANAHMED&ZEESHANAHMEDD"}]}},"CustomObject":{"bankCode":"49","purposeofRemittanceCode":"Purpose(code=0253, lastModifiedDateTime=null, paymentPurposeEn=Transport Payment, paymentPurposeUr=Transport Payment, purposeChecked=false)","senderCNIC":"0000000000000"}}
//     const data = {"Header":{"Channel":"App","SubChannel":"Mobile","UseCase":"QRPayment","ThirdPartyType":"merchantApp","Identity":{"Caller":{"ThirdPartyID":"ibm_merchant_app"},"Initiator":{"IdentifierType":1,"Identifier":"923328721082"},"ReceiverParty":{"IdentifierType":"1","Identifier":"923361414417"}},"AppConnectUUID":"863490b4-5117-11eb-a4ec-0c8205690000"},"Request":{"Transaction":{"CommandID":"InitTrans_MerchantPaymentByCustomer","OriginatorConversationID":"76f021b9T1610044703871","Parameters":{"Parameter":[{"Key":"Amount","Value":"1"},{"Key":"ChannelCode","Value":"1030"}]},"Timestamp":"20210107183824"}},"Result":{"ResultType":"1","ResultCode":"0","ResultDesc":"Process service request successfully.","TransactionID":"010711384825","ResultParameters":{"ResultParameter":[{"Key":"Amount","Value":"1.00"},{"Key":"TransEndDate","Value":"20210107"},{"Key":"TransEndTime","Value":"233824"}]}}};
//     let initTransData = {};
//     await DB2Connection.insertTransactionHistory(config.IBMDB2.schema, config.reportingDBTables.QR_PAYMENT, data);
//     res.status(200).json({message: "Done!", data: initTransData})
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