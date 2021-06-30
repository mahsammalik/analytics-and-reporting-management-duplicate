import { open } from 'ibm_db';
import responseCodeHandler from './responseCodeHandler';
import { logger } from '/util/';
import moment from 'moment';
import MsisdnTransformer from '../util/msisdnTransformer';

const cn = config.DB2_Jazz.connectionString // process.env.DB2Connection || config.IBMDB2_Test?.connectionString || config.IBMDB2_Dev?.connectionString;

//const schema = config.IBMDB2_Dev.schema; // temp comments: Mudassir not using this at all, need to confirm with Ebad if he is using this and if not remove this variable altogether

class DatabaseConn {

    async insertTransactionHistory(schemaName, tableName, data) {
        if (tableName === config.reportingDBTables.OUTGOING_IBFT) {
            let conn = await open(cn);
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
                // VALUES('${data.transactionIDEasyPaisa}', '${data.transactionIDEasyJazzcash}', '${data.transactionDate}', '${data.transactionTime}', ${data.receiverMsisdn}, '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', 0, 0, '', 0, '', '', '');
                // `);
                // stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.QR_PAYMENT) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (CHANNEL, MERCH_NAME, REVERS_TID, REVIEWS, THIRDPARTY_TID, TID, TILL_PAYMENT, TIP_AMOUNT, CONSUMER_BALANCE, CUST_MSISDN, "DATE", FEE_AMOUNT, MERCH_ACCOUNT, MERCH_BALANCE, MERCH_BANK, MERCH_CATEGORY_CODE, MERCH_CATEGORY_TYPE, MERCH_ID, PAID_VIA, QR_CODE, QR_TYPE, RATING, TRANS_AMOUNT, TRANS_STATUS, TOP_NAME, MSG_OFFSET) VALUES('${data.channel}', '${data.merchantName}', ${data.reverseTID}, '${data.reviews}', ${data.thirdPartTID}, ${data.TID}, ${data.tilPayment}, ${data.tipAmount}, ${data.consumerBalance}, ${data.custMsisdn}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.fee}, ${data.merchAccount}, ${data.merchBalance}, '${data.merchantBank}',
                '${data.merchCategoryCode}','${data.merchCategoryType}', ${data.merchID}, 
                '${data.paidVia}', '${data.qrCode}', '${data.qrType}', '${data.rating}', ${data.transAmount},
                '${data.transactionStatus}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.MOBILE_BUNDLE) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BUNDLE_NAME, BUNDLE_TYPE, CHANNEL, INITIATOR_MSISDN, NETWORK, TARGET_MSISDN, TRANS_DATE, TRANS_ID, TOP_NAME, MSG_OFFSET) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`);
                stmt.executeSync([data.amount, data.bundleName, data.bundleType, data.channel, data.initiatorMsisdn, data.network, data.targetMsisdn, data.transactionTime, data.TID, data.topic, data.msg_offset]);
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.DONATION) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, CHANNEL, "DATE", EMAIL, FAIL_REASON, FUND, MSISDN, ORGANIZATION, STATUS, TRANS_ID, TOP_NAME, MSG_OFFSET) VALUES(${data.amount}, '${data.channel}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.email}', '${data.failureReason}', '${data.fund}', ${data.msisdn}, '${data.organization}', '${data.transactionStatus}',${data.TID}, '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.BUS_TICKET) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                let stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_DATE, BOOKING_ID, CHANNEL, CNIC, DESTINATION, DISCOUNT, EMAIL, FEE, GENDER, MSISDN, ORIGIN, ORIG_PRICE, PRICE, PROMO, SEATS, SEAT_NUMBER, SERVICE, STATUS, FAILURE_REASON, TRANS_ID, TRAVEL_DATE, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.bookingID}, '${data.channel}', '${data.cnic}', '${data.destination}', '${data.discount}', '${data.email}', ${data.fee}, '${data.gender}', ${data.msisdn}, '${data.origin}', ${data.originPrice}, ${data.price}, '${data.promo}', '${data.seats}', '${data.seatNumber}', '${data.service}', '${data.transactionStatus}', '${data.failureReason}', ${data.TID}, '${data.travelDate}', '${data.topic}', ${data.msg_offset});`);
                if(data.travelDate == null)
                {
                    logger.debug("data.travelDate is null");
                    stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_DATE, BOOKING_ID, CHANNEL, CNIC, DESTINATION, DISCOUNT, EMAIL, FEE, GENDER, MSISDN, ORIGIN, ORIG_PRICE, PRICE, PROMO, SEATS, SEAT_NUMBER, SERVICE, STATUS, FAILURE_REASON, TRANS_ID, TRAVEL_DATE, TOP_NAME, MSG_OFFSET) 
                    VALUES(${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.bookingID}, '${data.channel}', '${data.cnic}', '${data.destination}', '${data.discount}', '${data.email}', ${data.fee}, '${data.gender}', ${data.msisdn}, '${data.origin}', ${data.originPrice}, ${data.price}, '${data.promo}', '${data.seats}', '${data.seatNumber}', '${data.service}', '${data.transactionStatus}', '${data.failureReason}', ${data.TID}, ${data.travelDate}, '${data.topic}', ${data.msg_offset});`);    
                }
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.EVENT_TICKET) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_ID, BOOK_DATE, CHANNEL, CITY, CNIC, DISCOUNT, EMAIL, EVENT, EVENT_DATE, FAIL_REASON, MSISDN, NUMBER_OF_SEATS, PARTNER, PRICE, PROMO_AMOUNT, PROMO_APPLIED, REVENUE, SEAT_CLASS, STATUS, TRANS_ID, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.amount}, '${data.bookingID}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.city}', '${data.cnic}', ${data.discount}, '${data.email}', '${data.event}', ${data.eventDate}, '${data.failReason}', ${data.msisdn}, ${data.numSeats}, '${data.partner}', ${data.price}, ${data.promoAmount}, '${data.promoApplied}', ${data.revenue}, '${data.seatClass}', '${data.status}', ${data.TID}, '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.DARAZ_WALLET) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", TRANS_ID, DARAZ_WALLET_NUM, DARAZ_WALLET_OWNER, DARAZ_WALLET_EMAIL, BALANCE_BEFORE_TRANS, PROMO_CODE, PROMO_CODE_AMOUNT, ACTUAL_AMOUNT, STATUS, FAILURE_REASON, MSISDN, USER_EMAIL, CHANNEL, TOP_NAME, MSG_OFFSET) 
                VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.TID}, ${data.walletNumber}, '${data.walletOwner}', '${data.walletEmail}', ${data.balanceBefore}, '${data.promoCode}', ${data.promoCodeAmount}, ${data.actualAmount}, '${data.status}', '${data.failureReason}', ${data.msisdn}, '${data.userEmail}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.EVOUCHER) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRANS_DATE, TRANS_ID, COMPANY, AMOUNT_DOLLAR, PROMO_CODE, PROMO_AMOUNT, ACTUAL_AMOUNT, STATUS, FAIL_REASON, MSISDN, EMAIL, CHANNEL, TOP_NAME, MSG_OFFSET) 
                VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.TID}, '${data.company}', ${data.amountDollar}, '${data.promoCode}', ${data.promoAmount}, ${data.actualAmount}, '${data.status}', '${data.failReason}', ${data.msisdn}, '${data.email}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }

        }

        if (tableName === config.reportingDBTables.DEPOSIT_VIA_CARD) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, CARD_NUM, CARD_TRANS_ID, TRANS_AMOUNT, TRANS_DATE, TRANS_STATUS, RETRIEVAL_REFERENCE, CASHIN_TRANSID, CASHIN_TRANSTATUS, CASHIN_AMOUNT, CASHIN_TRANSTIME, CHANNEL, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.msisdn}, ${data.cardNum}, ${data.TID}, ${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', ${data.retrivalRef}, ${data.cashInTransID}, '${data.cashInTransStatus}', ${data.amount}, ${data.cashInTransTime}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.CHANGE_MPIN) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, PIN_CHANGE_DATE, PIN_CHANGE_STATUS, IMEI, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(${data.msisdn}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', ${data.imei}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.RESET_MPIN) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, PIN_RESET_DATE, PIN_RESET_STATUS, IMEI, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(${data.msisdn}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', ${data.imei}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.REQUEST_TO_PAY) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (REQUEST_DATE, CHANNEL, BUSINESS_NAME, BUSINESS_LINK, NAME, EMAIL, JAZZCASH_ACC, BUSINESS_LOGO, REQ_MEDIUM, REQ_TYPE, REQ_ITEMS, TAX_SHIP_DISC_APPLIED, REQ_ID, AMOUNT, SERVICE_DESC, PAYMENT_DUE_DATE, DOC_ATTACH, STATUS, REMINDERS_SENT, PAYER_NAME, MOBILE_NUMBER, EMAIL_ID, EXTENSION_REQUESTED, PAYMENT_CHANNEL, EXISTING_ACCT, PAYMENT_DATE, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.reqDate}, '${data.channel}', '${data.businessName}', '${data.businessLink}', '${data.name}', '${data.email}', ${data.jazzcashAcc}, ${data.businessLogo}, '${data.reqMedium}', '${data.reqType}', '${data.reqItems}', '${data.tax_ship_disc_applied}', ${data.reqID}, ${data.amount}, '${data.serviceDescriptin}', ${data.paymentDueDate}, '${data.docAttached}', '${data.transactionStatus}', ${data.remindersSent}, '${data.payerName}', ${data.mobileNumber}, '${data.emailID}', ${data.extensionRequested}, '${data.paymentChannel}', '${data.existingAcc}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.NEW_SIGNUP_REWARD) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (POST_SIGNUP_BONUS, MSISDN, AMOUNT_POSTED, "DATE", "TIME", POSTING_STATUS, CHANNEL, TOP_NAME, MSG_OFFSET) 
                VALUES('${data.postSignupBonus}', ${data.msisdn}, ${data.amountPosted}, '${data.transactionDate}', '${data.transactionTime}', '${data.postingStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.FOOD_DELIVERY) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (ID, ORDER_DATE, RESTAURANT_NAME, TRANS_AMOUNT, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.id}', TIMESTAMP_FORMAT('${data.orderDate}','YYYY-MM-DD HH24:MI:SS'), '${data.resturantName}', ${data.amount}, '${data.transStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.DEBIT_CARD_TRACK) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRACK_DATE, "ACTION", MSISDN, CNIC, CARD_TYPE, CARD_CAT, ORDER_ID, ORDER_DATE, SUPL_CARD_NUMBER, SUPL_CARD_CNIC, TID, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.trackDate}, '${data.action}', ${data.msisdn}, '${data.cnic}', '${data.cardType}', '${data.cardCategory}', ${data.orderID}, '${data.transactionTime}', ${data.suplCardNum}, '${data.suplCardCnic}', ${data.TID}, '${data.transactionStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.CREATE_CARD_PIN) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("ACTION", CUST_MSISDN, CUST_CNIC, "DATE", PIN_CREATED_BEFORE, CARD_NUM, CARD_TYPE, CARD_CATEGORY, SUPL_CARD_NUM, SUPL_CARD_CNIC, TID, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES('${data.action}', ${data.msisdn}, '${data.cnic}', '${data.transactionTime}', '${data.pinCreated}', '${data.cardNum}', '${data.cardType}', '${data.cardCategory}', ${data.suplCardNum}, '${data.suplCardCnic}', ${data.TID}, '${data.transactionStatus}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.CARD_LINKING) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, TRANS_DATE, DELINK_STATUS, RETRIEVE_REF, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(${data.msisdn}, TIMESTAMP_FORMAT('${data.transDate}','YYYY-MM-DD HH24:MI:SS'), '${data.isDelinkSuccess}', ${data.retrieveRef}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.CARD_DELINK) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, TRANS_DATE, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(${data.msisdn}, TIMESTAMP_FORMAT('${data.transDate}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.INVITEANDEARN) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (INVITER_MSISDN, INVITER_NAME, RECEIVER_NUM, RECEIVER_NAME, REQ_CATEGORY, ACCOUNT_STATUS, REQ_STATUS, ACCEPT_DATE, ACCEPT_TIME, MODULE, REQ_CHANNEL, REGISTR_CHANNEL, AMOUNT_POSTED, AMOUNTPOSTING_DATE, AMOUNTPOSTING_TIME, MESSAGE, INVITE_DATE, INVITE_TIME, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(${data.inviterMsisdn}, '${data.inviterName}', ${data.receiverMsisdn}, '${data.receiverName}', '${data.reqCategory}', '${data.accountStatus}', '${data.reqStatus}', ${data.acceptDate}, ${data.acceptTime}, '${data.module}', '${data.reqChannel}', '${data.registerChannel}', ${data.amount}, '${data.amountPostedDate}', '${data.amountPostedTime}', '${data.message}', ${data.inviteDate}, ${data.inviteTime}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.SCHEDULED_TRANSACTIONS) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (INITIATOR_MSISDN, TRANS_TYPE, TRANS_AMOUNT, RECEIVER_MSISDN, TRANS_FREQUENCY, TRANS_STATUS, REPEAT_TRANS_DURATION, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(${data.initiatorMsisdn}, '${data.transType}', ${data.amount}, ${data.receiverMsisdn}, ${data.transFrequency}, '${data.transactionStatus}', '${data.repeatTransDuration}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.ACCOUNT_UPGRADE) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", CUST_MSISDN, CUST_CNIC, NADRA_RESPONSE, FINGERPRINT_TIME, APPUSER_DETAIL, NADRA_ERROR, CHANNEL, MERCH_MSISDN, MERCH_NIC, PERSONAL_NAME, BIUSINESS_NAME, TOP_NAME, MSG_OFFSET)
                VALUES(TIMESTAMP_FORMAT('${data.date}','YYYY-MM-DD HH24:MI:SS'), ${data.msisdn}, '${data.cnic}', '${data.nadraResponse}', '${data.fingerprintTime}', '${data.appUserDetails}', '${data.nadraError}', '${data.channel}', ${data.merchMsisdn}, '${data.merchNic}', '${data.personalName}', '${data.businessName}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.MOVIE_TICKET) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (BOOK_DATE, MOVIE_DATE, MSISDN, CNIC, EMAIL, TRANS_ID, CINEMA, SEAT_CLASS, CITY, SEATS, PRICE, REVENUE, TRANS_STATUS, AMOUNT, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(TIMESTAMP_FORMAT('${data.bookDate}','YYYY-MM-DD HH24:MI:SS'), TIMESTAMP_FORMAT('${data.movieDate}','YYYY-MM-DD HH24:MI:SS'), ${data.msisdn}, '${data.cnic}', '${data.email}', ${data.TID}, '${data.cinema}', '${data.seatClass}', '${data.city}', ${data.seats}, ${data.price}, ${data.revenue}, '${data.transStatus}', ${data.amount}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.DOORSTEP_CASHIN) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", AMOUNT, ADDRESS, CITY, LAT_LONG, REQUEST_STATUS, CUST_MSISDN, RIDER_NAME, RIDER_MSISDN, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(TIMESTAMP_FORMAT('${data.date}','YYYY-MM-DD HH24:MI:SS'), ${data.amount}, '${data.address}', '${data.city}', ${data.lat}, '${data.reqStatus}', ${data.custMsisdn}, '${data.riderName}', ${data.riderMsisdn}, '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.CAREEM_VOUCHER) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRANS_DATE, AMOUNT, MSISDN, TRANS_ID, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.amount}, ${data.msisdn}, ${data.TID}, '${data.status}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.PAYON_REG_LINK) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MOBILE_NUMBER, PAYON_USERNAME, ACTIVITY_DATE, CHANNEL, TOP_NAME, MSG_OFFSET)
                VALUES(${data.msisdn}, '${data.payUsername}', TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.PAYON_TRANSACTIONS) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`select * from ${schemaName}.${tableName} where TRANS_ID = ?;`);
                let result = stmt.executeSync([data.TID]);
                let resultArray = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
                // if record does't exist insert new record, otherwise update existing record
                if (resultArray.length == 0) {
                    const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MOBILE_NUMBER, PAYON_USERNAME, PKR_AMOUNT, USD_AMOUNT, EXCHANGE_RATE, CURRENCY, DESCRIPTION, ACTIVITY_DATE, MONETA_STATUS, CHANNEL, TRANS_ID, TOP_NAME, MSG_OFFSET)
                    VALUES(${data.msisdn}, '${data.payUsername}', ${data.pkrAmount}, ${data.usdAmount}, ${data.exchangeRate}, '${data.currency}', '${data.description}', TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), '${data.monetaStatus}', '${data.channel}', ${data.TID}, '${data.topic}', ${data.msg_offset});`);
                    stmt.executeSync();
                    stmt.closeSync();
                    //conn.close(function (err) { });
                    logger.debug("insert done");
                } else {
                    const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET MOBILE_NUMBER=${data.msisdn}, PAYON_USERNAME='${data.payUsername}', PKR_AMOUNT=${data.pkrAmount}, USD_AMOUNT=${data.usdAmount}, EXCHANGE_RATE=${data.exchangeRate}, CURRENCY='${data.currency}', DESCRIPTION='${data.description}', ACTIVITY_DATE=TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), MONETA_STATUS='${data.monetaStatus}', CHANNEL='${data.channel}', TOP_NAME='${data.topic}', MSG_OFFSET=${data.msg_offset} WHERE TRANS_ID=${data.TID};`);
                    stmt.executeSync();
                    stmt.closeSync();
                    //conn.close(function (err) { });
                    logger.debug("Record updated");
                }

            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.DISPLAY_QR) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MERCH_MSISDN, TILL_NUM, NOTIFIER_1, NOTIFIER_2, NOTIFIER_3, NOTIFIER_4, NOTIFIER_5, CHANNEL, QR_TYPE, MERCH_CAT_CODE, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.MerchantMSISDN}, ${data.TillNumber}, '${data.MoblieNumber1}', '${data.MoblieNumber2}', '${data.MoblieNumber3}', '${data.MoblieNumber4}', '${data.MoblieNumber5}', '${data.channel}', '${data.qrType}', '${data.MerchantCategoryCode}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.ONBOARDING) {
            logger.debug("Entered block Onboarding insertion")
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                logger.debug("connection opened");
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (APP_DOWNLOAD_DATE, OS, FIRST_OPEN_DATE, MERCHANT_ID, IMEI, APP_VERSION, DEVICE_MODEL, CHANNEL, ACTIVITY_DATE, ACTIVITY_TIME, MERCHANT_MSISDN, NEW_USER, ACC_LEVEL_FOR_NEW, ACCOUNT_STATUS, ACC_LEVEL_FOR_EXISTING, SIGNUP_DATE, SIGNUP_STEP, VERIFY_MODE, REGSITER_REQUEST, WALLET_REG_DATE, REG_STATUS, PERSONAL_NAME, BUSINESS_NAME, CRM_STATUS, REWARD_AMOUNT, REWARD_POST_DATE, TOP_NAME, MSG_OFFSET) 
                VALUES('${data.Date_of_App_Download}', '${data.OS}', '${data.Date_of_First_Open}', '${data.Login_Merchant_ID}', ${data.IMEI_Number}, '${data.App_Version}', '${data.Device_Model}', '${data.Channel}', '${data.Activity_Date}', '${data.Activity_Time}', ${data.Merchant_MSISDN}, '${data.New_Existing_User}', 
                '${data.Account_Level}', '${data.Consumer_Account_Status}', '${data.Account_Level_For_existing_User}', '${data.Date_of_Sign_up}', '${data.Sign_up_Step}', '${data.Verification_Mode}', '${data.Regsitration_request}', '${data.Wallet_Registration_Date}', '${data.Registration_Status}', '${data.Personal_Name}', '${data.Business_Name}', '${data.CRM_Status}', ${data.Reward_Amount}, '${data.Reward_posting_Date}', '${data.topic}', ${data.msg_offset});`);
                logger.debug('insert statement created')
                stmt.executeSync();
                logger.debug('insert query executed')
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Error in onboarding insertion')
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.FALLBACK_FAILURE) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, INSERT_DATE, CHANNEL, FAILURE_DETAIL, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.msisdn}, '${data.insertDate}', '${data.channel}', '${data.failureDetail}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Error in fallback failure insertion')
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.APP_SIGNUP) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (LOGIN_ID, CNIC, REG_STATUS, ACTIVITY_DATE, ACTIVITY_TIME, NEW_EXISTING_USER, WALLET_REG_DATE, APP_VERSION, DEVICE_MODEL, OS, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.loginID}, '${data.cnic}', '${data.reg_status}', '${data.activity_date}', '${data.activity_time}', '${data.new_existing_user}', '${data.walletRegDate}', '${data.app_version}', '${data.device_model}', '${data.os}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Error in consumer onboarding insertion')
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.DEVICE_AUTH) {
            let conn = await open(cn);
            try {
                if(data.doUpdate == false)
                {
                    // let conn = await open(cn);
                    const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, DEVICE_TYPE, APP_VERSION, CUST_IP, IMEI1, IMEI2, NEW_IMEI, DATE_TIME, AUTH_ATTEMPTED, AUTH_SUCCESS, DEVICE_MAKE, DEVICE_MODEL, TOP_NAME, MSG_OFFSET) 
                    VALUES(${data.msisdn}, '${data.deviceType}', '${data.app_version}', '${data.cust_ip}', '${data.imei1}', '${data.imei2}', '${data.new_imei}', '${data.dateTime}', '${data.authAttempted}', '${data.authSuccess}', '${data.deviceMake}', '${data.device_model}', '${data.topic}', ${data.msg_offset});`);
                    stmt.executeSync();
                    stmt.closeSync();
                    //conn.close(function (err) { });
                    logger.debug("insert done");
                }
                else
                {
                    //update last inserted record
                    const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET AUTH_ATTEMPTED='${data.authAttempted}', AUTH_SUCCESS = 'Yes' WHERE MSISDN=${data.msisdn} AND DEVICE_TYPE='${data.deviceType}' ORDER BY RECORD_DATE DESC LIMIT 1;`);
                    stmt.executeSync();
                    stmt.closeSync();
                    //conn.close(function (err) { });
                    logger.debug("update done");                    
                }
            } catch (err) {
                logger.error('Error in device auth insertion')
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

        if (tableName === config.reportingDBTables.WALLET_REQUEST) {
            let conn = await open(cn);
            try {
                // let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("NUMBER", NAME, CNIC, CRMSTATUS, REQ_SUBMIT_DATE, REQ_PROCESSED_BY, STATUS, CHANNEL, TOP_NAME, MSG_OFFSET) 
                VALUES(${data.msisdn}, '${data.name}', '${data.cnic}', '${data.crm_status}', '${data.request_submission_date}', '${data.processed_by}', '${data.status}', '${data.channel}', '${data.topic}', ${data.msg_offset});`);
                stmt.executeSync();
                stmt.closeSync();
                //conn.close(function (err) { });
                logger.debug("insert done");
            } catch (err) {
                logger.error('Error in wallet request insertion')
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            } finally {
                conn.close(function (err) { });
            }
        }

    }

    async getLatestAccountBalanceValue(customerMobileNumer, endDate) {

        try {
            let conn = await open(cn);

            let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
            const stmt = conn.prepareSync(`Select * from statements.ACCOUNTSTATEMENT where date(TRX_DATETIME)  <= '${endDate}' And MSISDN = ${customerMobileNumer} OR MSISDN = ${mappedMsisdn} order by TRX_DATETIME desc limit 1;`);
            let result = stmt.executeSync();
            let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            let updatedBalance = 0.00;

            resultArrayFormat.forEach((row) => {
                updatedBalance = row[row.length - 1];
            });

            result.closeSync();
            stmt.closeSync();
            conn.close(function (err) { });
            return updatedBalance;

        } catch (err) {
            logger.error('Database connection error' + err);
            return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
        }
    }


    async getValue(customerMobileNumer, endDate, startDate) {

        try {
            logger.info({ event: 'Entered function', functionName: 'getValue in class DatabaseConn' });

            let concatenatResult;

            let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
            const conn = await open(cn);
            const stmt = conn.prepareSync(`Select * from statements.ACCOUNTSTATEMENT where TRX_DATETIME BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?   ;`);
            const result = stmt.executeSync([startDate, endDate, customerMobileNumer, mappedMsisdn]);

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

    async getValueArray(customerMobileNumer, endDate, startDate) {

        try {

            logger.info({ event: 'Entered function', functionName: 'getValueArray in class DatabaseConn' });
            let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
            logger.debug("Updated Msisdn" + mappedMsisdn);

            const conn = await open(cn);
            //  const mobileNumber = customerMobileNumer.substr(customerMobileNumer.length - 10); //333333333
            const stmt = conn.prepareSync(`Select * from statements.ACCOUNTSTATEMENT where TRX_DATETIME BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?   ;`);
            const result = stmt.executeSync([startDate, endDate, customerMobileNumer, mappedMsisdn]);

            const arrayResult = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            result.closeSync();
            stmt.closeSync();
            conn.close();

            logger.info({ event: 'Exited function', functionName: 'getValueArray in class DatabaseConn', arrayResult });
            return arrayResult || [];

        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'getValueArray in class DatabaseConn', 'arguments': { customerMobileNumer, endDate, startDate }, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });
            throw new Error(`Database error ${error}`);
        }
    }

    async getTaxValueArray(customerMobileNumer, endDate, startDate) {

        try {

            let mappedMsisdn = await MsisdnTransformer.formatNumberSingle(customerMobileNumer, 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
            logger.debug("Updated Msisdn" + mappedMsisdn);
            logger.debug({ event: 'QUERY', String: `Select * from statements.TAXSTATEMENT where MSISDN = ${customerMobileNumer} OR MSISDN = ${mappedMsisdn} And TRX_DATETIME BETWEEN ${startDate} AND ${endDate}   ;` })
            const conn = await open(cn)
            //  const mobileNumber = customerMobileNumer.substr(customerMobileNumer.length - 10); //333333333
            const stmt = conn.prepareSync(`Select * from statements.TAXSTATEMENT where MSISDN = ${customerMobileNumer} OR MSISDN = ${mappedMsisdn} And TRX_DATETIME BETWEEN ${startDate} AND ${endDate}   ;`);
            const result = stmt.executeSync();
            const arrayResult = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            logger.debug("Exited getTaxValueArray: ", arrayResult)
            result.closeSync();
            stmt.closeSync();
            conn.close(function (err) {
                logger.debug("CONNECTION ERROR: ", err)
            });
            return arrayResult;

        } catch (err) {
            logger.error('Database connection error' + err);
            return "Database Error";
        }
    }

    async addAccountStatement(msisdn, trxDateTime, trxId, transactionType, channel, description, amountDebited, amountCredited, runningBalance) {

        try {

            let conn = await open(cn);
            const stmt = conn.prepareSync("INSERT INTO ${schema}.ACCOUNTSTATEMENT (MSISDN, TRX_DATETIME, TRX_ID, TRANSACTION_TYPE, CHANNEL, DESCRIPTION, AMOUNT_DEBITED, AMOUNT_CREDITED, RUNNING_BALANCE) VALUES(?,?,?,?,?,?,?,?,?);");
            stmt.executeSync([msisdn, trxDateTime, trxId, transactionType, channel, description, amountDebited, amountCredited, runningBalance]);
            // return result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            // result.closeSync();
            stmt.closeSync();
            conn.close(function (err) { });
            logger.debug("insert done");
            return;

        } catch (err) {
            logger.error('Database connection error' + err);
            return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
        }
    }

    async addTaxStatement(msisdn, trxDateTime, trxId, taxDeducted, salesTax, incomeTax, withHoldigTax, fee, comission) {

        try {

            let conn = await open(cn);
            const stmt = conn.prepareSync("INSERT INTO ${schema}.TAXSTATEMENT (MSISDN, TRX_DATETIME, TRX_ID, TAX_DEDUCTED, SALES_TAX, INCOME_TAX, WITHHOLDING_TAX, FEE, COMMISSION) VALUES('', '', '', '', '', '', '', '', '');");
            stmt.executeSync([msisdn, trxDateTime, trxId, taxDeducted, salesTax, incomeTax, withHoldigTax, fee, comission]);
            // return result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            // result.closeSync();
            stmt.closeSync();
            conn.close(function (err) { });
            logger.debug("insert done");
            return;

        } catch (err) {
            logger.error('Database connection error' + err);
            return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
        }
    }


}

export default new DatabaseConn();