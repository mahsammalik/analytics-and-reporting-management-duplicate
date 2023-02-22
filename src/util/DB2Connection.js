import { open , Pool} from 'ibm_db';
import responseCodeHandler from './responseCodeHandler';
import { logger } from '/util/';
import moment from 'moment';
import MsisdnTransformer from '../util/msisdnTransformer';
import DB2ConnectionPool from './DB2ConnPool'
import fetchQuery from './queries'
import { printLog, printError } from '../util/utility';
import { getMappedAccountStatement, getMappedAccountStatementMerchant } from '../util/accountStatementMapping';


let conPool = DB2ConnectionPool.getInstance();
const pool = new Pool();
const maxPoolSize = Number(process.env.DB2ConnMaxPoolSize) || config.DB2_Jazz.maxPoolSize
pool.setMaxPoolSize(maxPoolSize)
const cn = config.DB2_Jazz.connectionString // process.env.DB2Connection || config.IBMDB2_Test?.connectionString || config.IBMDB2_Dev?.connectionString;

//const connectionhca= config.DB2_HCA.connectionString
//const schema = config.IBMDB2_Dev.schema; // temp comments: Mudassir not using this at all, need to confirm with Ebad if he is using this and if not remove this variable altogether

async function getConnection() {
  let conn = null;
  try {
    conn = conPool.pool.openSync(cn);
  } catch (error) {
    logger.error({ message: "Unable to open connection from pool.", error: error });
  }

  if (!conn) {
    logger.info("Openning connection using open(cn)");
    conn = await open(cn);
  }
  return conn;
}

class DatabaseConn {

  async insertTransactionHistory(schemaName, tableName, data) {

    logger.info({
      event: 'Entered function',
      functionName: 'DB2Connection.insertTransactionHistory',
      data: {
        schemaName,
        tableName,
        data
      }
    });

    if (tableName === config.reportingDBTables.OUTGOING_IBFT) {
      let conn = await getConnection();
      try {
        //let conn = await open(cn);
        // const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} 
        // (TRX_OBJECTIVE, TRXID_JAZZCASH, TRXID_EASYPAISA, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, SENDER_NAME, INITIATOR_REGION, AMOUNT, TRX_STATUS, FAILURE_REASON, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, REVERSAL_STATUS, CHANNEL, TRANS_OBJECTIVE, FINID_JAZZCASH) 
        // VALUES('${data.paymentPurpose}' , ${data.transactionIDEasyJazzcash}, '${data.transactionIDEasyPaisa}' , '${data.transactionDate}' , '${data.transactionTime}' , ${data.receiverMsisdn} , '${data.receiverCnic}' , '${data.receiverName}' , '${data.identityLevel}' , '${data.region}' , '${data.city}' , '${data.address}' , ${data.amount} , '${data.transactionStatus}' , '${data.reversalStatus}' , '${data.senderName}' , '${data.senderBankName}' , '${data.senderAccount}' , '${data.reversedTrasactionID}' , '${data.reversedReason}' , '${data.reasonOfFailure}' , ${data.fee} , ${data.fed} , '${data.stan}' , ${data.currentBalance} , '${data.channel}' , '${data.financialIDEasyPaisa}');`);
        // stmt.executeSync();
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRX_OBJECTIVE, TRXID_JAZZCASH, TRXID_EASYPAISA, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, SENDER_NAME, INITIATOR_REGION, AMOUNT, TRX_STATUS, FAILURE_REASON, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, REVERSAL_STATUS, CHANNEL, TOP_NAME, MSG_OFFSET) 
                VALUES('${data.transactionObjective}', '${data.transactionIDJazzcash}', '${data.transactionIDEasyPaisa}', DATE('${data.transactionDate}'), TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.beneficiaryBankAccountTitle}', '${data.beneficiaryBankName}',
                 ${data.senderMsisdn}, '${data.beneficiaryBankAccountNumber}', '${data.senderLevel}', '${data.senderCnic}', ${data.receiverMsisdn}, ${data.initiatorMsisdn}, '${data.initiatorCity}',
                    '${data.senderName}', '${data.initiatorRegion}', ${data.amount}, '${data.transactionStatus}', '${data.reasonOfFailure}', ${data.fee}, ${data.fed},
                    ${data.commission}, ${data.wht}, '${data.stan}', ${data.currentBalance}, '${data.reversalStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        // const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName}
        // (TRXID_EASYPAISA, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, RECEIVER_MSISDN, RECEIVER_CNIC, RECEIVER_NAME, ID_LEVEL, REGION, CITY, ADDRESS, AMOUNT, TRX_STATUS, REVERSE_STATUS, SENDER_NAME, SENDER_BANK, SENDER_ACCOUNT, REVERSED_TRX_ID, REVERSED_REASON, FAILURE_REASON, FEE, FED, STAN, CURRENT_BALANCE, CHANNEL, FINID_EASYPAISA, TRANS_OBJECTIVE)
        // VALUES('${data.transactionIDEasyPaisa}', '${data. transactionIDEasyJazzcash}', '${data.transactionDate}', '${data.transactionTime}', ${data.receiverMsisdn}, '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', 0, 0, '', 0, '', '', '');
        // `);
        // stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error('Database connection error' + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.QR_PAYMENT) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.transactionStatus == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (CHANNEL, MERCH_NAME, REVERS_TID, REVIEWS, THIRDPARTY_TID, TID, TILL_PAYMENT, TIP_AMOUNT, CONSUMER_BALANCE, CUST_MSISDN, "DATE", FEE_AMOUNT, MERCH_ACCOUNT, MERCH_BALANCE, MERCH_BANK, MERCH_CATEGORY_CODE, MERCH_CATEGORY_TYPE, MERCH_ID, PAID_VIA, QR_CODE, QR_TYPE, RATING, TRANS_AMOUNT, TRANS_STATUS, TOP_NAME, MSG_OFFSET) VALUES('${data.channel}', '${data.merchantName}', ${data.reverseTID}, '${data.reviews}', ${data.thirdPartTID}, '${data.TID}', ${data.tilPayment}, ${data.tipAmount}, ${data.consumerBalance}, '${data.custMsisdn}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.fee}, ${data.merchAccount}, ${data.merchBalance}, '${data.merchantBank}',
                    '${data.merchCategoryCode}','${data.merchCategoryType}', '${data.merchID}', 
                    '${data.paidVia}', '${data.qrCode}', '${data.qrType}', '${data.rating}', ${data.transAmount},
                    '${data.transactionStatus}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.transactionStatus == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET MERCH_NAME='${data.merchantName}', MERCH_ID='${data.merchID}', PAID_VIA='${data.paidVia}', QR_CODE='${data.qrCode}', TRANS_STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.MOBILE_BUNDLE) {
        let conn = await getConnection();
        try {
            // let conn = await open(cn);
            if(data?.discounted != undefined && data?.discounted == true){
            if (data.transactionStatus == 'Pending' && data.typeOfTransaction =='init_merchant_to_payment') {
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BUNDLE_NAME, BUNDLE_TYPE, CHANNEL, INITIATOR_MSISDN, NETWORK, TARGET_MSISDN, TRANS_DATE, TRANS_ID, TOP_NAME, MSG_OFFSET, TRANS_STATUS, DISCOUNTED, TYPE_OF_TRANS) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`);
                stmt.executeSync([data.amount, data.bundleName, data.bundleType, data.channel, data.initiatorMsisdn, data.network, data.targetMsisdn, data.transactionTime, data.TID, data.topic, data.msg_offset, data.transactionStatus, data?.discounted ?data?.discounted:false, data?.typeOfTransaction ?data?.typeOfTransaction:'']);
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_insert done`);
            }
            else if (data.transactionStatus == 'Completed' && data.typeOfTransaction =='confirm_merchant_to_payment') {
                const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET='${data.msg_offset}', TYPE_OF_TRANS=CONCAT(TYPE_OF_TRANS, ',${data.typeOfTransaction}') WHERE TRANS_ID='${data.TID}';`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_update done`);
            }
            else if (data.typeOfTransaction == 'init_merchant_to_payment_refund') {
                const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET='${data.msg_offset}', TYPE_OF_TRANS=CONCAT(TYPE_OF_TRANS, ',${data.typeOfTransaction}'), TRANS_ID_REV='${data?.TIDReversal? data?.TIDReversal:''}', TRANS_ID_B_REV='${data?.TIDBReversal ?data?.TIDBReversal:''}',SUBSCRIPTION='${ data?.subscription ? data?.subscription :''}', BUNDLE_AMOUNT=${data?.bundleAmount ? data?.bundleAmount:0}, INCENTIVE_AMOUNT=${data?.incentiveAmount ? data?.incentiveAmount:0}, MSISDN_B='${data?.MsisdnB}'  WHERE TRANS_ID='${data.TID}';`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_insert refund done`);
            }
            else if (data.typeOfTransaction == 'confirm_merchant_to_payment_refund') {
                const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET='${data.msg_offset}', TYPE_OF_TRANS=CONCAT(TYPE_OF_TRANS, ',${data.typeOfTransaction}'), WHERE TRANS_ID='${data.TID}';`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_update refund done`);
            }
            else if (data.typeOfTransaction =='init_without_confirm_b2b' ) {

                const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}',
                TRANS_ID_B='${data.TIDB}', BUNDLE_AMOUNT=${ data.bundleAmount},INCENTIVE_AMOUNT=${data.incentiveAmount},
                INCENTIVE_AMOUNT_PARTNER=${data.incentiveAmountByPartner}, MSISDN_B='${data.MsisdnB}', TYPE_OF_TRANS=CONCAT(TYPE_OF_TRANS, ',${data.typeOfTransaction}'), TRANS_STATUS_B='${data.transactionStatusB}'  WHERE TRANS_ID='${data.TID}';`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_insert done b2b`);
            }
            else if (data.typeOfTransaction =='refund_without_confirm_b2b' ) {

                const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}',
                TRANS_ID_B='${data.TIDB}',TRANS_ID_B_REV='${data.TIDBReversal}', BUNDLE_AMOUNT=${ data.bundleAmount},INCENTIVE_AMOUNT=${data.incentiveAmount},
                INCENTIVE_AMOUNT_PARTNER=${data.incentiveAmountByPartner}, MSISDN_B='${data.MsisdnB}', TYPE_OF_TRANS=CONCAT(TYPE_OF_TRANS, ',${data.typeOfTransaction}'), TRANS_STATUS_B='${data.transactionStatusB}'  WHERE TRANS_ID='${data.TID}';`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_insert done b2b refund`);
            }
        }else{
            if (data.transactionStatus == 'Pending') {
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BUNDLE_NAME, BUNDLE_TYPE, CHANNEL, INITIATOR_MSISDN, NETWORK, TARGET_MSISDN, TRANS_DATE, TRANS_ID, TOP_NAME, MSG_OFFSET, TRANS_STATUS) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`);
                stmt.executeSync([data.amount, data.bundleName, data.bundleType, data.channel, data.initiatorMsisdn, data.network, data.targetMsisdn, data.transactionTime, data.TID, data.topic, data.msg_offset, data.transactionStatus]);
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_insert done`);
            }
            else if (data.transactionStatus == 'Completed') {
                const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET='${data.msg_offset}' WHERE TRANS_ID='${data.TID}';`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_update done`);
            }
        }
        } catch (err) {
            logger.error(`${schemaName}.${tableName} database connection error` + err);
            return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
        } finally {
            conn.close(function (err) { });
        }
    }

    if (tableName === config.reportingDBTables.MOBILE_BUNDLE_ZONG) {
        let conn = await open(cn);
        try {
            // let conn = await open(cn);
            if (data.transactionStatus == 'Pending') {
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BUNDLE_NAME, BUNDLE_TYPE, CHANNEL, INITIATOR_MSISDN, NETWORK, TARGET_MSISDN, TRANS_DATE, TRANS_ID, TOP_NAME, MSG_OFFSET, TRANS_STATUS, BUNDLE_VOICE, BUNDLE_SMS, BUNDLE_DATA, RESPONSE_CODE, RESPONSE_DESCRIPTION) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`);
                stmt.executeSync([data.amount, data.bundleName, data.bundleType, data.channel, data.initiatorMsisdn, data.network, data.targetMsisdn, data.transactionTime, data.TID, data.topic, data.msg_offset, data.transactionStatus, data.voiceMinutes, data.smsDetails, data.DataDetails, data.responseCode, data.responseDesc]);
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_insert done`);
            }
            else if (data.transactionStatus == 'Completed') {
                const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.info(`${schemaName}.${tableName}_update done`);
            }
        } catch (err) {
            logger.error(`${schemaName}.${tableName} database connection error` + err);
            return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
        } finally {
            conn.close(function (err) { });
        }
    }

    if (tableName === config.reportingDBTables.DONATION) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.transactionStatus == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, CHANNEL, "DATE", EMAIL, FAIL_REASON, FUND, MSISDN, ORGANIZATION, STATUS, TRANS_ID, TOP_NAME, MSG_OFFSET) VALUES(${data.amount}, '${data.channel}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.email}', '${data.failureReason}', '${data.fund}', '${data.msisdn}', '${data.organization}', '${data.transactionStatus}','${data.TID}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.transactionStatus == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.BUS_TICKET) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.transactionStatus == 'Pending') {
          let stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_DATE, BOOKING_ID, CHANNEL, CNIC, DESTINATION, DISCOUNT, EMAIL, FEE, GENDER, MSISDN, ORIGIN, ORIG_PRICE, PRICE, PROMO, SEATS, SEAT_NUMBER, SERVICE, STATUS, FAILURE_REASON, TRANS_ID, TRAVEL_DATE, TOP_NAME, MSG_OFFSET) 
                    VALUES(${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.bookingID}', '${data.channel}', '${data.cnic}', '${data.destination}', '${data.discount}', '${data.email}', ${data.fee}, '${data.gender}', '${data.msisdn}', '${data.origin}', ${data.originPrice}, ${data.price}, '${data.promo}', '${data.seats}', '${data.seatNumber}', '${data.service}', '${data.transactionStatus}', '${data.failureReason}', '${data.TID}', '${data.travelDate}', '${data.topic}', ${data.msg_offset});`);
          if (data.travelDate == null) {
            logger.debug("data.travelDate is null");
            stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_DATE, BOOKING_ID, CHANNEL, CNIC, DESTINATION, DISCOUNT, EMAIL, FEE, GENDER, MSISDN, ORIGIN, ORIG_PRICE, PRICE, PROMO, SEATS, SEAT_NUMBER, SERVICE, STATUS, FAILURE_REASON, TRANS_ID, TRAVEL_DATE, TOP_NAME, MSG_OFFSET) 
                        VALUES(${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.bookingID}', '${data.channel}', '${data.cnic}', '${data.destination}', '${data.discount}', '${data.email}', ${data.fee}, '${data.gender}', '${data.msisdn}', '${data.origin}', ${data.originPrice}, ${data.price}, '${data.promo}', '${data.seats}', '${data.seatNumber}', '${data.service}', '${data.transactionStatus}', '${data.failureReason}', '${data.TID}', ${data.travelDate}, '${data.topic}', ${data.msg_offset});`);
          }
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.transactionStatus == 'Completed') {
          let stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET BOOKING_ID='${data.bookingID}', CNIC='${data.cnic}', EMAIL='${data.email}', FEE=${data.fee}, ORIG_PRICE=${data.originPrice}, PRICE=${data.price}, SEAT_NUMBER='${data.seatNumber}', STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.EVENT_TICKET) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.status == 'Pending') {
          let stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_ID, BOOK_DATE, CHANNEL, CITY, CNIC, DISCOUNT, EMAIL, EVENT, EVENT_DATE, FAIL_REASON, MSISDN, NUMBER_OF_SEATS, PARTNER, PRICE, PROMO_AMOUNT, PROMO_APPLIED, REVENUE, SEAT_CLASS, STATUS, TRANS_ID, TOP_NAME, MSG_OFFSET) 
                    VALUES(${data.amount}, '${data.bookingID}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.city}', '${data.cnic}', ${data.discount}, '${data.email}', '${data.event}', '${data.eventDate}', '${data.failReason}', '${data.msisdn}', ${data.numSeats}, '${data.partner}', ${data.price}, ${data.promoAmount}, '${data.promoApplied}', ${data.revenue}, '${data.seatClass}', '${data.status}', '${data.TID}', '${data.topic}', ${data.msg_offset});`);
          if (data.eventDate == null) {
            stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_ID, BOOK_DATE, CHANNEL, CITY, CNIC, DISCOUNT, EMAIL, EVENT, EVENT_DATE, FAIL_REASON, MSISDN, NUMBER_OF_SEATS, PARTNER, PRICE, PROMO_AMOUNT, PROMO_APPLIED, REVENUE, SEAT_CLASS, STATUS, TRANS_ID, TOP_NAME, MSG_OFFSET) 
                        VALUES(${data.amount}, '${data.bookingID}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.city}', '${data.cnic}', ${data.discount}, '${data.email}', '${data.event}', ${data.eventDate}, '${data.failReason}', '${data.msisdn}', ${data.numSeats}, '${data.partner}', ${data.price}, ${data.promoAmount}, '${data.promoApplied}', ${data.revenue}, '${data.seatClass}', '${data.status}', '${data.TID}', '${data.topic}', ${data.msg_offset});`);
          }
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.status == 'Completed') {
          let stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET BOOKING_ID='${data.bookingID}', CITY='${data.city}', CNIC='${data.cnic}', PARTNER='${data.partner}', PRICE=${data.price}, PROMO_APPLIED='${data.promoApplied}', STATUS='${data.status}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.DARAZ_WALLET) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.status == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", TRANS_ID, DARAZ_WALLET_NUM, DARAZ_WALLET_OWNER, DARAZ_WALLET_EMAIL, BALANCE_BEFORE_TRANS, PROMO_CODE, PROMO_CODE_AMOUNT, ACTUAL_AMOUNT, STATUS, FAILURE_REASON, MSISDN, USER_EMAIL, CHANNEL, TOP_NAME, MSG_OFFSET) 
                    VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.TID}', ${data.walletNumber}, '${data.walletOwner}', '${data.walletEmail}', ${data.balanceBefore}, '${data.promoCode}', ${data.promoCodeAmount}, ${data.actualAmount}, '${data.status}', '${data.failureReason}', '${data.msisdn}', '${data.userEmail}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.status == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET DARAZ_WALLET_OWNER='${data.walletOwner}', STATUS='${data.status}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.EVOUCHER) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.status == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRANS_DATE, TRANS_ID, COMPANY, AMOUNT_DOLLAR, PROMO_CODE, PROMO_AMOUNT, ACTUAL_AMOUNT, STATUS, FAIL_REASON, MSISDN, EMAIL, CHANNEL, TOP_NAME, MSG_OFFSET) 
                    VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.TID}', '${data.company}', ${data.amountDollar}, '${data.promoCode}', ${data.promoAmount}, ${data.actualAmount}, '${data.status}', '${data.failReason}', '${data.msisdn}', '${data.email}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.status == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET COMPANY='${data.company}', ACTUAL_AMOUNT=${data.actualAmount}, STATUS='${data.status}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }

    }

    if (tableName === config.reportingDBTables.DEPOSIT_VIA_CARD) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.transactionStatus == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, CARD_NUM, CARD_TRANS_ID, TRANS_AMOUNT, TRANS_DATE, TRANS_STATUS, RETRIEVAL_REFERENCE, CASHIN_TRANSID, CASHIN_TRANSTATUS, CASHIN_AMOUNT, CASHIN_TRANSTIME, CHANNEL, TOP_NAME, MSG_OFFSET) 
                    VALUES('${data.msisdn}', '${data.cardNum}', '${data.TID}', ${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', '${data.retrivalRef}', '${data.cashInTransID}', '${data.cashInTransStatus}', ${data.amount}, TIMESTAMP_FORMAT('${data.cashInTransTime}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.transactionStatus == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}', CASHIN_TRANSTATUS='${data.cashInTransStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE CARD_TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.CHANGE_MPIN) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, PIN_CHANGE_DATE, PIN_CHANGE_STATUS, IMEI, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.msisdn}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', ${data.imei}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.RESET_MPIN) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, PIN_RESET_DATE, PIN_RESET_STATUS, IMEI, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.msisdn}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', ${data.imei}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.REQUEST_TO_PAY) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.transactionStatus == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (REQUEST_DATE, CHANNEL, BUSINESS_NAME, BUSINESS_LINK, NAME, EMAIL, JAZZCASH_ACC, BUSINESS_LOGO, REQ_MEDIUM, REQ_TYPE, REQ_ITEMS, TAX_SHIP_DISC_APPLIED, REQ_ID, AMOUNT, SERVICE_DESC, PAYMENT_DUE_DATE, DOC_ATTACH, STATUS, REMINDERS_SENT, PAYER_NAME, MOBILE_NUMBER, EMAIL_ID, EXTENSION_REQUESTED, PAYMENT_CHANNEL, EXISTING_ACCT, PAYMENT_DATE, TOP_NAME, MSG_OFFSET, TRANS_ID) 
                    VALUES(${data.reqDate}, '${data.channel}', '${data.businessName}', '${data.businessLink}', '${data.name}', '${data.email}', '${data.jazzcashAcc}', ${data.businessLogo}, '${data.reqMedium}', '${data.reqType}', '${data.reqItems}', '${data.tax_ship_disc_applied}', ${data.reqID}, ${data.amount}, '${data.serviceDescriptin}', ${data.paymentDueDate}, '${data.docAttached}', '${data.transactionStatus}', ${data.remindersSent}, '${data.payerName}', '${data.mobileNumber}', '${data.emailID}', ${data.extensionRequested}, '${data.paymentChannel}', '${data.existingAcc}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.topic}', ${data.msg_offset},'${data.TID}');`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.transactionStatus == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET NAME='${data.name}', STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.NEW_SIGNUP_REWARD) {
      logger.info("a: Entered block NEW_SIGNUP_REWARD");
      let conn = await getConnection();
      logger.info("b: Connection opened");
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`SELECT * FROM ${schemaName}.${tableName} WHERE TRANS_ID = '${data.TID}';`);
        logger.info("c: Select statement prepared")
        let result = stmt.executeSync();
        logger.info("d: Select statement executed")
        let resultArray = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
        logger.info(`${schemaName}.${tableName}_selectQuery executed`);
        // if record does't exist insert new record, otherwise update existing record
        if (resultArray.length == 0) {
          logger.info("e: 0 record found, going to insert new record")
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (POST_SIGNUP_BONUS, MSISDN, AMOUNT_POSTED, "DATE", "TIME", POSTING_STATUS, CHANNEL, TOP_NAME, MSG_OFFSET, TRANS_ID) 
                    VALUES('${data.postSignupBonus}', '${data.msisdn}', ${data.amountPosted}, '${data.transactionDate}', '${data.transactionTime}', '${data.postingStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset}, '${data.TID}');`);
          logger.info("f: Insert statement prepared")
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.FOOD_DELIVERY) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (ID, ORDER_DATE, RESTAURANT_NAME, TRANS_AMOUNT, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.id}', TIMESTAMP_FORMAT('${data.orderDate}','YYYY-MM-DD HH24:MI:SS'), '${data.resturantName}', ${data.amount}, '${data.transStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.DEBIT_CARD_TRACK) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.transactionStatus == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRACK_DATE, "ACTION", MSISDN, CNIC, CARD_TYPE, CARD_CAT, ORDER_ID, ORDER_DATE, SUPL_CARD_NUMBER, SUPL_CARD_CNIC, TID, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET) 
                    VALUES(${data.trackDate}, '${data.action}', '${data.msisdn}', '${data.cnic}', '${data.cardType}', '${data.cardCategory}', ${data.orderID}, '${data.transactionTime}', ${data.suplCardNum}, '${data.suplCardCnic}', '${data.TID}', '${data.transactionStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.transactionStatus == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.CREATE_CARD_PIN) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("ACTION", CUST_MSISDN, CUST_CNIC, "DATE", PIN_CREATED_BEFORE, CARD_NUM, CARD_TYPE, CARD_CATEGORY, SUPL_CARD_NUM, SUPL_CARD_CNIC, TID, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.action}', '${data.msisdn}', '${data.cnic}', '${data.transactionTime}', '${data.pinCreated}', '${data.cardNum}', '${data.cardType}', '${data.cardCategory}', ${data.suplCardNum}, '${data.suplCardCnic}', '${data.TID}', '${data.transactionStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.CARD_LINKING) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, TRANS_DATE, RETRIEVE_REF, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.msisdn}', TIMESTAMP_FORMAT('${data.transDate}','YYYY-MM-DD HH24:MI:SS'), '${data.retrieveRef}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.CARD_DELINK) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, TRANS_DATE, DELINK_STATUS, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.msisdn}', TIMESTAMP_FORMAT('${data.transDate}','YYYY-MM-DD HH24:MI:SS'), '${data.isDelinkSuccess}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.INVITEANDEARN) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.reqStatus == 'Pending') {
          let stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (INVITER_MSISDN, INVITER_NAME, RECEIVER_NUM, RECEIVER_NAME, REQ_CATEGORY, ACCOUNT_STATUS, REQ_STATUS, ACCEPT_DATE, ACCEPT_TIME, MODULE, REQ_CHANNEL, REGISTR_CHANNEL, AMOUNT_POSTED, AMOUNTPOSTING_DATE, AMOUNTPOSTING_TIME, MESSAGE, INVITE_DATE, INVITE_TIME, CHANNEL, TOP_NAME, MSG_OFFSET, TRANS_ID)
                    VALUES('${data.inviterMsisdn}', '${data.inviterName}', '${data.receiverMsisdn}', '${data.receiverName}', '${data.reqCategory}', '${data.accountStatus}', '${data.reqStatus}', '${data.acceptDate}', '${data.acceptTime}', '${data.module}', '${data.reqChannel}', '${data.registerChannel}', ${data.amount}, '${data.amountPostedDate}', '${data.amountPostedTime}', '${data.message}', '${data.inviteDate}', '${data.inviteTime}', '${data.channel}', '${data.topic}', ${data.msg_offset}, '${data.TID}');`);
          if (data.inviteDate == null || data.acceptDate == null) {
            stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (INVITER_MSISDN, INVITER_NAME, RECEIVER_NUM, RECEIVER_NAME, REQ_CATEGORY, ACCOUNT_STATUS, REQ_STATUS, ACCEPT_DATE, ACCEPT_TIME, MODULE, REQ_CHANNEL, REGISTR_CHANNEL, AMOUNT_POSTED, AMOUNTPOSTING_DATE, AMOUNTPOSTING_TIME, MESSAGE, INVITE_DATE, INVITE_TIME, CHANNEL, TOP_NAME, MSG_OFFSET, TRANS_ID)
                        VALUES('${data.inviterMsisdn}', '${data.inviterName}', '${data.receiverMsisdn}', '${data.receiverName}', '${data.reqCategory}', '${data.accountStatus}', '${data.reqStatus}', ${data.acceptDate}, ${data.acceptTime}, '${data.module}', '${data.reqChannel}', '${data.registerChannel}', ${data.amount}, '${data.amountPostedDate}', '${data.amountPostedTime}', '${data.message}', ${data.inviteDate}, ${data.inviteTime}, '${data.channel}', '${data.topic}', ${data.msg_offset}, '${data.TID}');`);
          }
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.reqStatus == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET REQ_STATUS='${data.reqStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.SCHEDULED_TRANSACTIONS) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.transactionStatus == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (INITIATOR_MSISDN, TRANS_TYPE, TRANS_AMOUNT, RECEIVER_MSISDN, TRANS_FREQUENCY, TRANS_STATUS, REPEAT_TRANS_DURATION, CHANNEL, TOP_NAME, MSG_OFFSET, TRANS_ID)
                    VALUES('${data.initiatorMsisdn}', '${data.transType}', ${data.amount}, '${data.receiverMsisdn}', ${data.transFrequency}, '${data.transactionStatus}', '${data.repeatTransDuration}', '${data.channel}', '${data.topic}', ${data.msg_offset}, '${data.TID}');`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.transactionStatus == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transactionStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.ACCOUNT_UPGRADE) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", CUST_MSISDN, CUST_CNIC, NADRA_RESPONSE, FINGERPRINT_TIME, APPUSER_DETAIL, NADRA_ERROR, CHANNEL, MERCH_MSISDN, MERCH_NIC, PERSONAL_NAME, BIUSINESS_NAME, TOP_NAME, MSG_OFFSET)
                VALUES(TIMESTAMP_FORMAT('${data.date}','YYYY-MM-DD HH24:MI:SS'), '${data.msisdn}', '${data.cnic}', '${data.nadraResponse}', '${data.fingerprintTime}', '${data.appUserDetails}', '${data.nadraError}', '${data.channel}', '${data.merchMsisdn}', '${data.merchNic}', '${data.personalName}', '${data.businessName}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.MOVIE_TICKET) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.transStatus == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (BOOK_DATE, MOVIE_DATE, MSISDN, CNIC, EMAIL, TRANS_ID, CINEMA, SEAT_CLASS, CITY, SEATS, PRICE, REVENUE, TRANS_STATUS, AMOUNT, CHANNEL, TOP_NAME, MSG_OFFSET)
                    VALUES(TIMESTAMP_FORMAT('${data.bookDate}','YYYY-MM-DD HH24:MI:SS'), TIMESTAMP_FORMAT('${data.movieDate}','YYYY-MM-DD HH24:MI:SS'), '${data.msisdn}', '${data.cnic}', '${data.email}', '${data.TID}', '${data.cinema}', '${data.seatClass}', '${data.city}', ${data.seats}, ${data.price}, ${data.revenue}, '${data.transStatus}', ${data.amount}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.transStatus == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET TRANS_STATUS='${data.transStatus}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.DOORSTEP_CASHIN) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", AMOUNT, ADDRESS, CITY, LAT_LONG, REQUEST_STATUS, CUST_MSISDN, RIDER_NAME, RIDER_MSISDN, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(TIMESTAMP_FORMAT('${data.date}','YYYY-MM-DD HH24:MI:SS'), ${data.amount}, '${data.address}', '${data.city}', ${data.lat}, '${data.reqStatus}', '${data.custMsisdn}', '${data.riderName}', '${data.riderMsisdn}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.CAREEM_VOUCHER) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        if (data.status == 'Pending') {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRANS_DATE, AMOUNT, MSISDN, TRANS_ID, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET)
                    VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.amount}, '${data.msisdn}', '${data.TID}', '${data.status}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else if (data.status == 'Completed') {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET STATUS='${data.status}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_update done`);
        }
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.PAYON_REG_LINK) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, PAYON_USERNAME, CREATED_ON, CHANNEL, TOP_NAME, MSG_OFFSET, EMAIL, COUNTRY, CITY, ZIPCODE, ADDRESS, STATUS_TEXT, CUST_LEVEL, CUST_JAZCASH_EMAIL, STATUS, PAYOUT_TYPE)
                VALUES('${data.msisdn}', '${data.payUsername}', TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.topic}', ${data.msg_offset}, '${data.email}', '${data.country}', '${data.city}', '${data.zip_code}', '${data.address}', '${data.status_text}', '${data.cust_level}', '${data.jcEmail}', '${data.status}', '${data.payoutType}');`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.PAYON_TRANSACTIONS) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`select * from ${schemaName}.${tableName} where TRANS_ID = '${data.TID}';`);
        let result = stmt.executeSync();
        let resultArray = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
        logger.info(`${schemaName}.${tableName}_selectQuery executed`);
        // if record does't exist insert new record, otherwise update existing record
        if (resultArray.length == 0) {
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MOBILE_NUMBER, PAYON_USERNAME, "RRN", PKR_AMOUNT, USD_AMOUNT, EXCHANGE_RATE, CURRENCY, DESCRIPTION, ACTIVITY_DATE, MONETA_STATUS, RECEIPT_STATUS, CHANNEL, TRANS_ID, TOP_NAME, MSG_OFFSET, CUST_LEVEL)
                    VALUES('${data.msisdn}', '${data.payUsername}', '${data.TID}', ${data.pkrAmount}, ${data.usdAmount}, ${data.exchangeRate}, '${data.currency}', '${data.description}', TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), '${data.monetaStatus}', '${data.receiptStatus}', '${data.channel}', ${data.TID}, '${data.topic}', ${data.msg_offset}, '${data.custLevel}');`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insertQuery executed`);
          logger.info(`${schemaName}.${tableName}_insert done`);
        } else {
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET MOBILE_NUMBER='${data.msisdn}', PAYON_USERNAME='${data.payUsername}', CUST_LEVEL='${data.custLevel}', "RRN"=${data.TID}, PKR_AMOUNT=${data.pkrAmount}, USD_AMOUNT=${data.usdAmount}, EXCHANGE_RATE=${data.exchangeRate}, CURRENCY='${data.currency}', DESCRIPTION='${data.description}', ACTIVITY_DATE=TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), MONETA_STATUS='${data.monetaStatus}', RECEIPT_STATUS='${data.receiptStatus}', CHANNEL='${data.channel}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID='${data.TID}';`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_updateQuery executed`);
          logger.info(`${schemaName}.${tableName}_update done`);
        }

      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.DISPLAY_QR) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MERCH_MSISDN, TILL_NUM, NOTIFIER_1, NOTIFIER_2, NOTIFIER_3, NOTIFIER_4, NOTIFIER_5, CHANNEL, QR_TYPE, MERCH_CAT_CODE, TOP_NAME, MSG_OFFSET) 
                VALUES('${data.MerchantMSISDN}', '${data.TillNumber}', '${data.MoblieNumber1}', '${data.MoblieNumber2}', '${data.MoblieNumber3}', '${data.MoblieNumber4}', '${data.MoblieNumber5}', '${data.channel}', '${data.qrType}', '${data.MerchantCategoryCode}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.ONBOARDING) {
      logger.debug("Entered block Onboarding insertion")
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        logger.debug("connection opened");
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (APP_DOWNLOAD_DATE, OS, FIRST_OPEN_DATE, MERCHANT_ID, IMEI, APP_VERSION, DEVICE_MODEL, CHANNEL, ACTIVITY_DATE, ACTIVITY_TIME, MERCHANT_MSISDN, NEW_USER, ACC_LEVEL_FOR_NEW, ACCOUNT_STATUS, ACC_LEVEL_FOR_EXISTING, SIGNUP_DATE, SIGNUP_STEP, VERIFY_MODE, REGSITER_REQUEST, WALLET_REG_DATE, REG_STATUS, PERSONAL_NAME, BUSINESS_NAME, CRM_STATUS, REWARD_AMOUNT, REWARD_POST_DATE, TOP_NAME, MSG_OFFSET) 
                VALUES('${data.Date_of_App_Download}', '${data.OS}', '${data.Date_of_First_Open}', '${data.Login_Merchant_ID}', ${data.IMEI_Number}, '${data.App_Version}', '${data.Device_Model}', '${data.Channel}', '${data.Activity_Date}', '${data.Activity_Time}', '${data.Merchant_MSISDN}', '${data.New_Existing_User}', 
                '${data.Account_Level}', '${data.Consumer_Account_Status}', '${data.Account_Level_For_existing_User}', '${data.Date_of_Sign_up}', '${data.Sign_up_Step}', '${data.Verification_Mode}', '${data.Regsitration_request}', '${data.Wallet_Registration_Date}', '${data.Registration_Status}', '${data.Personal_Name}', '${data.Business_Name}', '${data.CRM_Status}', ${data.Reward_Amount}, '${data.Reward_posting_Date}', '${data.topic}', ${data.msg_offset});`);
        logger.debug('insert statement created')
        stmt.executeSync();
        logger.debug('insert query executed')
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error('Error in onboarding insertion')
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.FALLBACK_FAILURE) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, INSERT_DATE, CHANNEL, FAILURE_DETAIL, TOP_NAME, MSG_OFFSET) 
                VALUES('${data.msisdn}', '${data.insertDate}', '${data.channel}', '${data.failureDetail}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error('Error in fallback failure insertion')
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.APP_SIGNUP) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (LOGIN_ID, CNIC, REG_STATUS, ACTIVITY_DATE, ACTIVITY_TIME, NEW_EXISTING_USER, WALLET_REG_DATE, APP_VERSION, DEVICE_MODEL, OS, TOP_NAME, MSG_OFFSET) 
                VALUES('${data.loginID}', '${data.cnic}', '${data.reg_status}', '${data.activity_date}', '${data.activity_time}', '${data.new_existing_user}', '${data.walletRegDate}', '${data.app_version}', '${data.device_model}', '${data.os}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error('Error in consumer onboarding insertion')
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.DEVICE_AUTH) {
      let conn = await getConnection();
      try {
        if (data.doUpdate == false) {
          // let conn = await open(cn);
          const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, DEVICE_TYPE, APP_VERSION, CUST_IP, IMEI1, IMEI2, NEW_IMEI, DATE_TIME, AUTH_ATTEMPTED, AUTH_SUCCESS, DEVICE_MAKE, DEVICE_MODEL, TOP_NAME, MSG_OFFSET) 
                    VALUES('${data.msisdn}', '${data.deviceType}', '${data.app_version}', '${data.cust_ip}', '${data.imei1}', '${data.imei2}', '${data.new_imei}', '${data.dateTime}', '${data.authAttempted}', '${data.authSuccess}', '${data.deviceMake}', '${data.device_model}', '${data.topic}', ${data.msg_offset});`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.info(`${schemaName}.${tableName}_insert done`);
        }
        else {
          //update last inserted record
          const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET AUTH_ATTEMPTED='${data.authAttempted}', AUTH_SUCCESS = 'Yes' WHERE MSISDN=${data.msisdn} AND DEVICE_TYPE='${data.deviceType}' ORDER BY RECORD_DATE DESC LIMIT 1;`);
          stmt.executeSync();
          stmt.closeSync();
          //conn.close(function (err) { });
          logger.debug("update done");
        }
      } catch (err) {
        logger.error('Error in device auth insertion')
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.WALLET_REQUEST) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("NUMBER", NAME, CNIC, CRMSTATUS, REQ_SUBMIT_DATE, REQ_PROCESSED_BY, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET) 
                VALUES('${data.msisdn}', '${data.name}', '${data.cnic}', '${data.crm_status}', '${data.request_submission_date}', '${data.processed_by}', '${data.status}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error('Error in wallet request insertion')
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.CARD_BLOCK) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("ACTION", MSISDN, "DATE", CARD_NUM, CARD_TYPE, CARD_CAT, TID, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.action}', '${data.msisdn}', '${data.transactionTime}', '${data.cardNum}', '${data.cardType}', '${data.cardCategory}', '${data.TID}', '${data.transactionStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error('Error in CardBlock insertion')
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.INSURANCE_CLAIM) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", JAZZCASH_ACCT_NUM, JAZZCASH_ACCT_TITLE, CLAIM_DESC, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(TIMESTAMP_FORMAT('${data.date}','YYYY-MM-DD HH24:MI:SS'), '${data.msisdn}', '${data.title}', '${data.description}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error('Error in InsuranceClaim insertion')
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.PAYON_LOGIN) {
      let conn = await getConnection();
      try {
        // let conn = await open(cn);
        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, JAZZCASH_EMAIL, PAYON_EMAIL, "DATE", CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.msisdn}', '${data.email}', '${data.payEmail}', '${data.activityDate}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);
      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.CASHBACK_REDEEM) {
      logger.info("Entered CASHBACK_REDEEM block");
      let conn = await open(cn);
      try {
        logger.info("Connection opened");
        let stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, REWARDTYPE, EXPIRYDATE, AMOUNT, REWARDDESCRIPTION, CAMPAIGNCODE, CAMPAIGNNAME, STATUS, TXID, CHANNEL, MSG_OFFSET, TOP_NAME, FAILURE_REASON, TRANS_DATE) 
                VALUES('${data.msisdn}', '${data.rewardType}', '${data.expiryDate}', ${data.amount}, '${data.rewardsDescription}', '${data.campaignCode}', '${data.campaignName}', '${data.status}', '${data.txID}', '${data.channel}', ${data.msg_offset}, '${data.topic}', '${data.failureReason}', '${data.transactionTime}');`);

        if (data.transactionTime == '') {
          stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, REWARDTYPE, EXPIRYDATE, AMOUNT, REWARDDESCRIPTION, CAMPAIGNCODE, CAMPAIGNNAME, STATUS, TXID, CHANNEL, MSG_OFFSET, TOP_NAME, FAILURE_REASON) 
                    VALUES('${data.msisdn}', '${data.rewardType}', '${data.expiryDate}', ${data.amount}, '${data.rewardsDescription}', '${data.campaignCode}', '${data.campaignName}', '${data.status}', '${data.txID}', '${data.channel}', ${data.msg_offset}, '${data.topic}', '${data.failureReason}');`);
        }

        stmt.executeSync();
        stmt.closeSync();
        //conn.close(function (err) { });
        logger.info(`${schemaName}.${tableName}_insert done`);

      } catch (err) {
        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
      } finally {
        conn.close(function (err) { });
      }
    }

    if (tableName === config.reportingDBTables.CASHTOGOOD) {

      let conn = await getConnection();

      try {

        const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} 
                (
                    senderMsisdn,
                    senderName,
                    txID, 
                    txEndDate,
                    txEndTime, 
                    amount,
                    chCode,
                    receiverMsisdn,
                    receiverName,
                    categoryName,
                    completionStatus
                )

                VALUES
                (
                    '${data.senderMsisdn}',
                    '${data.senderName}',
                    '${data.txID}', 
                    '${data.txEndDate}',
                    '${data.txEndTime}', 
                    '${data.amount}',
                    '${data.chCode}',
                    '${data.receiverMsisdn}',
                    '${data.receiverName}',
                    '${data.categoryName}',
                    '${data.completionStatus}'
                );`
        );

        stmt.executeSync();
        stmt.closeSync();

        logger.info(`${schemaName}.${tableName}_insert done`);

      } catch (err) {

        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);

      } finally {
        conn.close(function (err) { });
      }

    }

    if (tableName === config.reportingDBTables.CASHTOGOOD_REDEEM) {

      let conn = await getConnection();

      try {

        let stmt = "";

        if (data.multiPaymentQrpayment) {

          stmt = conn.prepareSync(`
                            UPDATE ${schemaName}.${tableName} 
                            SET
                                qrPaymentTransactionId='${data.qrPaymentTransactionId}',
                                depositTransactionId='${data.depositTransactionId}'

                            WHERE
                                redeemTransactionId='${data.redeemTransactionId}'
                            `
          );

        } else if (data.cashToGoodRefund) {

          stmt = conn.prepareSync(`
                        UPDATE ${schemaName}.${tableName} 
                        SET
                            refundTransactionId='${data.refundTransactionId}'

                        WHERE
                            redeemTransactionId='${data.redeemTransactionId}'
                        `
          );

        } else {

          stmt = conn.prepareSync(`
                    INSERT INTO ${schemaName}.${tableName} 
                    (
                        senderMsisdn,
                        redeemTransactionId,
                        txEndDate, 
                        txEndTime, 
                        amount,
                        chCode,
                        completionStatus
                    )

                    VALUES
                    (
                        '${data.senderMsisdn}',
                        '${data.redeemTransactionId}', 
                        '${data.txEndDate}',
                        '${data.txEndTime}', 
                        '${data.amount}',
                        '${data.chCode}',
                        '${data.completionStatus}'

                    );`
          );
        }

        stmt.executeSync();
        stmt.closeSync();

        logger.info(`${schemaName}.${tableName}_${data.multiPaymentQrpayment || data.cashToGoodRefund ? 'update' : 'insert'} done`);

      } catch (err) {

        logger.error(`${schemaName}.${tableName} database connection error` + err);
        return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);

      } finally {
        conn.close(function (err) { });
      }

    }


  }


  async getLatestAccountBalanceValue(customerMobileNumer, mappedMsisdn, endDate) {
    // get connection from connection pool
    let conn = await getConnection();
    // if connection is null then open it using connection string
    if (!conn) {
      conn = await open(cn);
    }

    try {
      // let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
      // logger.info(`Step 02 b: mappedMSISDN `)
      const stmt = conn.prepareSync(`Select RUNNING_BALANCE from statements.ACCOUNTSTATEMENT where (MSISDN = '${customerMobileNumer}' OR MSISDN = '${mappedMsisdn}') AND (date(TRX_DATETIME)  <= '${endDate}') order by TRX_DATETIME desc limit 1;`);
      let result = stmt.executeSync();
      let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      let updatedBalance = 0.00;

      if (resultArrayFormat.length > 0) {
        updatedBalance = resultArrayFormat[0];
      }

      result.closeSync();
      stmt.closeSync();
      // logger.info(`Step 02: c Returning updated balance ${updatedBalance}`)
      return updatedBalance / 100;    // convert last 2 digits to decimals (19800 to 198.00) as datatype is BIGINT in db

    } catch (err) {
      logger.error('Database connection error' + err);
      logger.error(err);
      return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
    } finally {
      conn.close(function (err) { if (err) { logger.error(err) } });
    }
  }

  async getLatestAccountBalanceValueWithConn(customerMobileNumer, mappedMsisdn, endDate, conn) {

    try {
      logger.info(`Step 01 a : Obtaining latest account balance`)

      logger.info(`Obtained connection`)

      // let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
      // logger.info(`Step 02 b: mappedMSISDN `);

      var query = `Select RUNNING_BALANCE from statements.ACCOUNTSTATEMENT where (MSISDN = '${customerMobileNumer}' OR MSISDN = '${mappedMsisdn}') AND (date(TRX_DATETIME)  <= '${endDate}') order by TRX_DATETIME desc Limit 1;`;
      logger.info('QUERU ' + query);
      var result = conn.queryResultSync(query);
      //const stmt = conn.prepareSync(`Select RUNNING_BALANCE from statements.ACCOUNTSTATEMENT where (MSISDN = ${customerMobileNumer} OR MSISDN = ${mappedMsisdn}) AND (date(TRX_DATETIME)  <= '${endDate}') order by TRX_DATETIME desc Limit 1;`);
      logger.info(`Step 03 b: prepareSynced Success `)
      //let result =  result.executeSync();
      //let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      // let updatedBalance = 0.00;
      logger.info('After prepare sync connection');

      let updatedBalance = 0.0;
      let updatedBalanceResult = result.fetchAllSync({ fetchMode: 3 });
      if (updatedBalanceResult.length > 0) {
        updatedBalance = updatedBalanceResult[0];
      }
      logger.info('updated Balance' + updatedBalance);
      // resultArrayFormat.forEach((row) => {
      //     updatedBalance = row[row.length - 1];
      // });

      result.closeSync();
      // stmt.closeSync();
      logger.info(`Step 02: c Returning updated balance ${updatedBalance}`)
      return updatedBalance / 100;    // convert last 2 digits to decimals (19800 to 198.00) as datatype is BIGINT in db

    } catch (err) {
      logger.error('Database connection error' + err);
      logger.error(err);
      throw err;
      // return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
    }
  }

  async getValue(customerMobileNumer, endDate, startDate) {

    try {
      logger.info({ event: 'Entered function', functionName: 'getValue in class DatabaseConn' });

      let concatenatResult;

      let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
      let conn = await getConnection();
      const stmt = conn.prepareSync(`Select * from statements.ACCOUNTSTATEMENT where Date(TRX_DATETIME) BETWEEN ? AND ? And MSISDN = ?  ;`);
      const result = stmt.executeSync([startDate, endDate, customerMobileNumer]);

      let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      let sumBalance = 0.00;
      let sumCredit = 0.00;
      let sumDebit = 0.00;

      if (resultArrayFormat.length > 0)
        resultArrayFormat = resultArrayFormat.map((dat) => {
          dat.splice(0, 1);
          let b = dat[1];
          dat[1] = dat[0];
          dat[0] = b;
          dat[dat.length - 3] = dat[dat.length - 3] / 100;
          dat[dat.length - 2] = dat[dat.length - 2] / 100;
          dat[dat.length - 1] = dat[dat.length - 1] / 100;
          return dat
        });

      resultArrayFormat.forEach((row) => {
        sumDebit += parseFloat(row[row.length - 3]);
        sumCredit += parseFloat(row[row.length - 2]);
        sumBalance += parseFloat(row[row.length - 1]);
      });
      resultArrayFormat.push(["Total", "", "", "", "", parseFloat(sumDebit).toFixed(2), parseFloat(sumCredit).toFixed(2), parseFloat(sumBalance).toFixed(2)]);
      concatenatResult = resultArrayFormat.join('\n');
      logger.debug("the result of database" + concatenatResult, resultArrayFormat);
      result.closeSync();
      stmt.closeSync();
      conn.close(function (err) { });
      logger.info({ event: 'Exited function', functionName: 'getValue in class DatabaseConn', concatenatResult });
      return concatenatResult;

    } catch (err) {
      logger.error('Database connection error' + err);
      return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
    }
  }
  async getValueMerchant(customerMobileNumer, endDate, startDate) {

    try {
      logger.info({ event: 'Entered function', functionName: 'getValueMerchant in class DatabaseConn' });

      let concatenatResult;

      let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
      let conn = await getConnection();

      const query = fetchQuery("merchantAccountStatmentCSV")

      const stmt = conn.prepareSync(query);
      const result = stmt.executeSync([startDate, endDate, customerMobileNumer, mappedMsisdn]);

      let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      let sumBalance = 0.00;
      let sumFee = 0.00;
      let sumCredit = 0.00;
      let sumDebit = 0.00;

      if (resultArrayFormat.length > 0) {
        resultArrayFormat = resultArrayFormat.map(arr => {
          return getMappedAccountStatementMerchant(arr);
        }).sort(function (a, b) {
          var dateA = new Date(a[0]), dateB = new Date(b[0]);
          return dateA - dateB;
        })
      }


      resultArrayFormat.forEach((row) => {
        sumDebit += parseFloat(row[row.length - 5]);
        sumCredit += parseFloat(row[row.length - 4]);
        sumFee += parseFloat(row[row.length - 3]);
        sumBalance += parseFloat(row[row.length - 2]);
      });


      resultArrayFormat.push(["Total", "", "", "", "", parseFloat(sumDebit).toFixed(2), parseFloat(sumCredit).toFixed(2), parseFloat(sumFee).toFixed(2), parseFloat(sumBalance).toFixed(2)]);
      concatenatResult = resultArrayFormat.join('\n');

      logger.debug("the result of database" + concatenatResult, resultArrayFormat);
      result.closeSync();
      stmt.closeSync();
      conn.close(function (err) { });
      logger.info({ event: 'Exited function', functionName: 'getValueMerchant in class DatabaseConn', concatenatResult });
      return concatenatResult;

    } catch (err) {
      logger.error('Database connection error' + err);
      return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
    }
  }

  async getValueArray(customerMobileNumer, endDate, startDate) {

    try {

      logger.info({ event: 'Entered function', functionName: 'getValueArray in class DatabaseConn' });
      let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
      logger.debug("Updated Msisdn" + mappedMsisdn);

      let conn = await getConnection();
      //  const mobileNumber = customerMobileNumer.substr(customerMobileNumer.length - 10); //333333333
      const stmt = conn.prepareSync(`Select MSISDN, TRX_DATETIME, TRX_ID, TRX_YPE, CHANNEL, DESCRIPTION, AMOUNT_DEBITED, AMOUNT_CREDITED, RUNNING_BALANCE, REASON_TYPE from statements.ACCOUNTSTATEMENT where DATE(TRX_DATETIME) BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?   ;`);
      const result = stmt.executeSync([startDate, endDate, customerMobileNumer, mappedMsisdn]);

      const arrayResult = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      result.closeSync();
      stmt.closeSync();
      conn.close();
      logger.info({ event: 'Response from DB2', functionName: 'getValueArray', count: arrayResult.length });
      logger.info({ event: 'Exited function', functionName: 'getValueArray in class DatabaseConn', arrayResult });
      return arrayResult || [];

    } catch (error) {
      logger.error({ event: 'Error  thrown', functionName: 'getValueArray in class DatabaseConn', 'arguments': { customerMobileNumer, endDate, startDate }, 'error': error });
      logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });
      throw new Error(`Database error ${error}`);
    }
  }

  async getValueArrayMerchant(customerMobileNumer, endDate, startDate) {

    let conn = await getConnection();

    try {

      if (!conn) {
        conn = await open(cn);
      }

      let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******

      printLog(
        'Updated Msisdn',
        'DatabaseConn.getValueArrayMerchant',
        { mappedMsisdn }
      );

      const query = fetchQuery("merchantAccountStatmentPDF")

      const statement = conn.prepareSync(query);
      const result = statement.executeSync([startDate, endDate, customerMobileNumer, mappedMsisdn]);
      const output = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.

      result.closeSync();
      statement.closeSync();
      conn.close();

      printLog(
        'Exiting function',
        'getValueArrayMerchant in class DatabaseConn',
        { output }
      );

      return output || [];

    } catch (error) {

      printError(error, 'getValueArrayMerchant in class DatabaseConn')

      throw new Error(`Database error ${error}`);
    }
  }

  //Tax Statemet 
  async getTaxValueArray(customerMobileNumer, mappedMsisdn, endDate, startDate) {
    // get connection from connection pool
    let conn = await getConnection();
    // if connection is null then open it using connection string
    if (!conn) {
      conn = await open(cn);
    }
    try {

      // let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
      // logger.debug("Updated Msisdn" + mappedMsisdn);
      logger.debug({ event: 'QUERY', String: `Select * from statements.TAXSTATEMENT where MSISDN = ${customerMobileNumer} OR MSISDN = ${mappedMsisdn} And TRX_DATETIME BETWEEN '${startDate}' AND '${endDate}'   ;` })
      //  const mobileNumber = customerMobileNumer.substr(customerMobileNumer.length - 10); //333333333
      const stmt = conn.prepareSync(`Select * from statements.TAXSTATEMENT where (MSISDN = '${customerMobileNumer}' OR MSISDN = '${mappedMsisdn}') And (Date(TRX_DATETIME) BETWEEN '${startDate}' AND '${endDate}')   ;`);
      const result = stmt.executeSync();
      const arrayResult = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      logger.debug("Exited getTaxValueArray: ", arrayResult)
      result.closeSync();
      stmt.closeSync();
      return arrayResult;

    } catch (err) {
      logger.error('Database connection error' + err);
      return "Database Error";
    } finally {
      conn.close(function (err) {
        if (err) {
          logger.error(err)
        }
      });
    }
  }

  async getTaxValueArrayWithConn(customerMobileNumer, mappedMsisdn, endDate, startDate, conn) {
    try {

      // let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
      // logger.debug("Updated Msisdn" + mappedMsisdn);
      logger.debug({ event: 'QUERY', String: `Select * from statements.TAXSTATEMENT where MSISDN = ${customerMobileNumer} OR MSISDN = ${mappedMsisdn} And TRX_DATETIME BETWEEN '${startDate}' AND '${endDate}'   ;` })
      //  const mobileNumber = customerMobileNumer.substr(customerMobileNumer.length - 10); //333333333
      const stmt = conn.prepareSync(`Select * from statements.TAXSTATEMENT where (MSISDN = ${customerMobileNumer} OR MSISDN = ${mappedMsisdn}) And (Date(TRX_DATETIME) BETWEEN '${startDate}' AND '${endDate}')   ;`);
      const result = await stmt.executeSync();
      const arrayResult = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      logger.debug("Exited getTaxValueArray: ", arrayResult)
      result.closeSync();
      stmt.closeSync();
      return arrayResult;

    } catch (err) {
      logger.error('Database connection error' + err);
      throw err;
    }
  }

  async addAccountStatement(msisdn, trxDateTime, trxId, transactionType, channel, description, amountDebited, amountCredited, runningBalance) {

    try {

      let conn = await getConnection();
      const stmt = conn.prepareSync("INSERT INTO ${schema}.ACCOUNTSTATEMENT (MSISDN, TRX_DATETIME, TRX_ID, TRANSACTION_TYPE, CHANNEL, DESCRIPTION, AMOUNT_DEBITED, AMOUNT_CREDITED, RUNNING_BALANCE) VALUES(?,?,?,?,?,?,?,?,?);");
      stmt.executeSync([msisdn, trxDateTime, trxId, transactionType, channel, description, amountDebited, amountCredited, runningBalance]);
      // return result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      // result.closeSync();
      stmt.closeSync();
      conn.close(function (err) { });
      logger.info(`${schemaName}.${tableName}_insert done`);
      return;

    } catch (err) {
      logger.error('Database connection error' + err);
      return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
    }
  }

  async addTaxStatement(msisdn, trxDateTime, trxId, taxDeducted, salesTax, incomeTax, withHoldigTax, fee, comission) {

    try {

      let conn = await getConnection();
      const stmt = conn.prepareSync("INSERT INTO ${schema}.TAXSTATEMENT (MSISDN, TRX_DATETIME, TRX_ID, TAX_DEDUCTED, SALES_TAX, INCOME_TAX, WITHHOLDING_TAX, FEE, COMMISSION) VALUES('', '', '', '', '', '', '', '', '');");
      stmt.executeSync([msisdn, trxDateTime, trxId, taxDeducted, salesTax, incomeTax, withHoldigTax, fee, comission]);
      // return result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      // result.closeSync();
      stmt.closeSync();
      conn.close(function (err) { });
      logger.info(`${schemaName}.${tableName}_insert done`);
      return;

    } catch (err) {
      logger.error('Database connection error' + err);
      return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
    }
  }

  async addLoginReporting(payload) {
    let conn = await getConnection();
  try {
    logger.debug('payload data');
    logger.debug(payload);
    const stmt = conn.prepareSync(`INSERT INTO COMMON.LOGIN_AUTH_REPORTING (MSISDN, CNIC, DOB, FULLNAME,EMAIL,CUSTOMER_TYPE,REGISTRATION_DATE,CNIC_EXPIRY,LOGIN_TIME,VERSION,PUSHID )
    VALUES
    (
        '${payload.MSISDN}',
        '${payload.CNIC}',
        '${payload.DOB}', 
        '${payload.FIRSTNAME}',
        '${payload.EMAIL}',
        '${payload.CUSTOMER_TYPE}',
        '${payload.REGISTRATION_DATE}',
        '${payload.CNIC_EXPIRY}',
        '${payload.LOGIN_TIME}',
        '${payload.VERSION}',
        '${payload.PUSHID}'
    );`
    );
    stmt.executeSync();
    stmt.closeSync();
    logger.debug(`LOGIN_REPORT insertion done`);
    return;

  } catch (err) {
    logger.error('Database connection error' + err);
    return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
  } finally {
    conn.close(function (err) { });
}
  }
  
  async addLoginReportingV2(payload) {
    try {
      pool.open(cn, async (error, conn) => {
        if (error) {
          throw error;
        }
        try {
          let query = `INSERT INTO COMMON.LOGIN_AUTH_REPORTING (MSISDN, CNIC, DOB, FULLNAME,EMAIL,CUSTOMER_TYPE,REGISTRATION_DATE,CNIC_EXPIRY,LOGIN_TIME,VERSION,PUSHID )
                            VALUES
                            (
                                '${payload.MSISDN}',
                                '${payload.CNIC}',
                                '${payload.DOB}', 
                                '${payload.FIRSTNAME}',
                                '${payload.EMAIL}',
                                '${payload.CUSTOMER_TYPE}',
                                '${payload.REGISTRATION_DATE}',
                                '${payload.CNIC_EXPIRY}',
                                '${payload.LOGIN_TIME}',
                                '${payload.VERSION}',
                                '${payload.PUSHID}'
                            );`
          await conn.query(query);

          logger.info({
            event: '******  DB2 Insertion was successful  ******',
            functionName: 'DB2Connection.addLoginReportingV2'
          });
        } catch (err) {
          logger.error({
            event: `database connection error` + err,
            functionName: 'DB2Connection.addLoginReportingV2',
          });
        } finally {
          conn.close();
          logger.debug({
            event: 'Finally block - connection closed',
            functionName: 'DB2Connection.addLoginReportingV2'
          });
        }


      });
    }
    catch (error) {
      logger.info({
        event: '***** Error *****',
        functionName: 'DB2Connection.report',
        data,
        error: {
          message: error?.message,
          stack: error?.stack
        }
      });
    }
  }

  
}


export default new DatabaseConn();