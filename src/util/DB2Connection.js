import { open } from 'ibm_db';
import responseCodeHandler from './responseCodeHandler';
import { logger } from '/util/';
import moment from 'moment';

const cn = process.env.DB2Connection || config.IBMDB2_Test?.connectionString || config.IBMDB2_Dev?.connectionString;
const schema = config.IBMDB2_Dev.schema;

class DatabaseConn {

    async insertTransactionHistory(schemaName, tableName, data) {
        if (tableName === config.reportingDBTables.OUTGOING_IBFT) {
            try {
                let conn = await open(cn);
                // const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} 
                // (TRX_OBJECTIVE, TRXID_JAZZCASH, TRXID_EASYPAISA, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, SENDER_NAME, INITIATOR_REGION, AMOUNT, TRX_STATUS, FAILURE_REASON, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, REVERSAL_STATUS, CHANNEL, TRANS_OBJECTIVE, FINID_JAZZCASH) 
                // VALUES('${data.paymentPurpose}' , ${data.transactionIDEasyJazzcash}, '${data.transactionIDEasyPaisa}' , '${data.transactionDate}' , '${data.transactionTime}' , ${data.receiverMsisdn} , '${data.receiverCnic}' , '${data.receiverName}' , '${data.identityLevel}' , '${data.region}' , '${data.city}' , '${data.address}' , ${data.amount} , '${data.transactionStatus}' , '${data.reversalStatus}' , '${data.senderName}' , '${data.senderBankName}' , '${data.senderAccount}' , '${data.reversedTrasactionID}' , '${data.reversedReason}' , '${data.reasonOfFailure}' , ${data.fee} , ${data.fed} , '${data.stan}' , ${data.currentBalance} , '${data.channel}' , '${data.financialIDEasyPaisa}');`);
                // stmt.executeSync();
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRX_OBJECTIVE, TRXID_JAZZCASH, TRXID_EASYPAISA, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, SENDER_NAME, INITIATOR_REGION, AMOUNT, TRX_STATUS, FAILURE_REASON, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, REVERSAL_STATUS, CHANNEL) 
                VALUES('${data.transactionObjective}', '${data.transactionIDJazzcash}', '${data.transactionIDEasyPaisa}', DATE('${data.transactionDate}'), TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.beneficiaryBankAccountTitle}', '${data.beneficiaryBankName}',
                 ${data.senderMsisdn}, '${data.beneficiaryBankAccountNumber}', '${data.senderLevel}', '${data.senderCnic}', ${data.receiverMsisdn}, ${data.initiatorMsisdn}, '${data.initiatorCity}',
                    '${data.senderName}', '${data.initiatorRegion}', ${data.amount}, '${data.transactionStatus}', '${data.reasonOfFailure}', ${data.fee}, ${data.fed},
                    ${data.commission}, ${data.wht}, '${data.stan}', ${data.currentBalance}, '${data.reversalStatus}', '${data.channel}');`);
                stmt.executeSync();
                // const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName}
                // (TRXID_EASYPAISA, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, RECEIVER_MSISDN, RECEIVER_CNIC, RECEIVER_NAME, ID_LEVEL, REGION, CITY, ADDRESS, AMOUNT, TRX_STATUS, REVERSE_STATUS, SENDER_NAME, SENDER_BANK, SENDER_ACCOUNT, REVERSED_TRX_ID, REVERSED_REASON, FAILURE_REASON, FEE, FED, STAN, CURRENT_BALANCE, CHANNEL, FINID_EASYPAISA, TRANS_OBJECTIVE)
                // VALUES('${data.transactionIDEasyPaisa}', '${data.transactionIDEasyJazzcash}', '${data.transactionDate}', '${data.transactionTime}', ${data.receiverMsisdn}, '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', 0, 0, '', 0, '', '', '');
                // `);
                // stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.QR_PAYMENT) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (CHANNEL, MERCH_NAME, REVERS_TID, REVIEWS, THIRDPARTY_TID, TID, TILL_PAYMENT, TIP_AMOUNT, CONSUMER_BALANCE, CUST_MSISDN, "DATE", FEE_AMOUNT, MERCH_ACCOUNT, MERCH_BALANCE, MERCH_BANK, MERCH_CATEGORY_CODE, MERCH_CATEGORY_TYPE, MERCH_ID, PAID_VIA, QR_CODE, QR_TYPE, RATING, TRANS_AMOUNT, TRANS_STATUS) VALUES('${data.channel}', '${data.merchantName}', ${data.reverseTID}, '${data.reviews}', ${data.thirdPartTID}, ${data.TID}, ${data.tilPayment}, ${data.tipAmount}, ${data.consumerBalance}, ${data.custMsisdn}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.fee}, ${data.merchAccount}, ${data.merchBalance}, '${data.merchantBank}',
                '${data.merchCategoryCode}','${data.merchCategoryType}', ${data.merchID}, 
                '${data.paidVia}', '${data.qrCode}', '${data.qrType}', '${data.rating}', ${data.transAmount},
                '${data.transactionStatus}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.MOBILE_BUNDLE) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BUNDLE_NAME, BUNDLE_TYPE, CHANNEL, INITIATOR_MSISDN, NETWORK, TARGET_MSISDN, TRANS_DATE, TRANS_ID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`);
                stmt.executeSync([data.amount, data.bundleName, data.bundleType, data.channel, data.initiatorMsisdn, data.network, data.targetMsisdn, data.transactionDate, data.TID]);
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.DONATION) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, CHANNEL, "DATE", EMAIL, FAIL_REASON, FUND, MSISDN, ORGANIZATION, STATUS, TRANS_ID) VALUES(${data.amount}, '${data.channel}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.email}', '${data.failureReason}', '${data.fund}', ${data.msisdn}, '${data.organization}', '${data.transactionStatus}',${data.TID});`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.BUS_TICKET) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_DATE, BOOKING_ID, CHANNEL, CNIC, DESTINATION, DISCOUNT, EMAIL, FEE, GENDER, MSISDN, ORIGIN, ORIG_PRICE, PRICE, PROMO, SEATS, SEAT_NUMBER, SERVICE, STATUS, FAILURE_REASON, TRANS_ID, TRAVEL_DATE) 
                VALUES(${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.bookingID}, '${data.channel}', '${data.cnic}', '${data.destination}', '${data.discount}', '${data.email}', ${data.fee}, '${data.gender}', ${data.msisdn}, '${data.origin}', ${data.originPrice}, ${data.price}, '${data.promo}', '${data.seats}', '${data.seatNumber}', '${data.service}', '${data.transactionStatus}', '${data.failureReason}', ${data.TID}, ${data.travelDate});`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.EVENT_TICKET) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (AMOUNT, BOOKING_ID, BOOK_DATE, CHANNEL, CITY, CNIC, DISCOUNT, EMAIL, EVENT, EVENT_DATE, FAIL_REASON, MSISDN, NUMBER_OF_SEATS, PARTNER, PRICE, PROMO_AMOUNT, PROMO_APPLIED, REVENUE, SEAT_CLASS, STATUS, TRANS_ID) 
                VALUES(${data.amount}, '${data.bookingID}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.city}', '${data.cnic}', ${data.discount}, '${data.email}', '${data.event}', ${data.eventDate}, '${data.failReason}', ${data.msisdn}, ${data.numSeats}, '${data.partner}', ${data.price}, ${data.promoAmount}, '${data.promoApplied}', ${data.revenue}, '${data.seatClass}', '${data.status}', ${data.TID});`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.DARAZ_WALLET) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", TRANS_ID, DARAZ_WALLET_NUM, DARAZ_WALLET_OWNER, DARAZ_WALLET_EMAIL, BALANCE_BEFORE_TRANS, PROMO_CODE, PROMO_CODE_AMOUNT, ACTUAL_AMOUNT, STATUS, FAILURE_REASON, MSISDN, USER_EMAIL, CHANNEL) 
                VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.TID}, ${data.walletNumber}, '${data.walletOwner}', '${data.walletEmail}', ${data.balanceBefore}, '${data.promoCode}', ${data.promoCodeAmount}, ${data.actualAmount}, '${data.status}', '${data.failureReason}', ${data.msisdn}, '${data.userEmail}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.EVOUCHER) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRANS_DATE, TRANS_ID, COMPANY, AMOUNT_DOLLAR, PROMO_CODE, PROMO_AMOUNT, ACTUAL_AMOUNT, STATUS, FAIL_REASON, MSISDN, EMAIL, CHANNEL) 
                VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.TID}, '${data.company}', ${data.amountDollar}, '${data.promoCode}', ${data.promoAmount}, ${data.actualAmount}, '${data.status}', '${data.failReason}', ${data.msisdn}, '${data.email}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }

        }

        if (tableName === config.reportingDBTables.DEPOSIT_VIA_CARD) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, CARD_NUM, CARD_TRANS_ID, TRANS_AMOUNT, TRANS_DATE, TRANS_STATUS, RETRIEVAL_REFERENCE, CASHIN_TRANSID, CASHIN_TRANSTATUS, CASHIN_AMOUNT, CASHIN_TRANSTIME, CHANNEL) 
                VALUES(${data.msisdn}, ${data.cardNum}, ${data.TID}, ${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', ${data.retrivalRef}, ${data.cashInTransID}, '${data.cashInTransStatus}', ${data.amount}, ${data.cashInTransTime}, '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.CHANGE_MPIN) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, PIN_CHANGE_DATE, PIN_CHANGE_STATUS, IMEI, CHANNEL)
                VALUES(${data.msisdn}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', ${data.imei}, '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.RESET_MPIN) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, PIN_RESET_DATE, PIN_RESET_STATUS, IMEI, CHANNEL)
                VALUES(${data.msisdn}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.transactionStatus}', ${data.imei}, '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.REQUEST_TO_PAY) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (REQUEST_DATE, CHANNEL, BUSINESS_NAME, BUSINESS_LINK, NAME, EMAIL, JAZZCASH_ACC, BUSINESS_LOGO, REQ_MEDIUM, REQ_TYPE, REQ_ITEMS, TAX_SHIP_DISC_APPLIED, REQ_ID, AMOUNT, SERVICE_DESC, PAYMENT_DUE_DATE, DOC_ATTACH, STATUS, REMINDERS_SENT, PAYER_NAME, MOBILE_NUMBER, EMAIL_ID, EXTENSION_REQUESTED, PAYMENT_CHANNEL, EXISTING_ACCT, PAYMENT_DATE) 
                VALUES(${data.reqDate}, '${data.channel}', '${data.businessName}', '${data.businessLink}', '${data.name}', '${data.email}', ${data.jazzcashAcc}, ${data.businessLogo}, '${data.reqMedium}', '${data.reqType}', '${data.reqItems}', '${data.tax_ship_disc_applied}', ${data.reqID}, ${data.amount}, '${data.serviceDescriptin}', ${data.paymentDueDate}, '${data.docAttached}', '${data.transactionStatus}', ${data.remindersSent}, '${data.payerName}', ${data.mobileNumber}, '${data.emailID}', ${data.extensionRequested}, '${data.paymentChannel}', '${data.existingAcc}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'));`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.NEW_SIGNUP_REWARD) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (POST_SIGNUP_BONUS, MSISDN, AMOUNT_POSTED, "DATE", "TIME", POSTING_STATUS, CHANNEL) 
                VALUES('${data.postSignupBonus}', ${data.msisdn}, ${data.amountPosted}, '${data.transactionDate}', '${data.transactionTime}', '${data.postingStatus}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.FOOD_DELIVERY) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (ID, ORDER_DATE, RESTAURANT_NAME, TRANS_AMOUNT, STATUS, CHANNEL)
                VALUES('${data.id}', TIMESTAMP_FORMAT('${data.orderDate}','YYYY-MM-DD HH24:MI:SS'), '${data.resturantName}', ${data.amount}, '${data.transStatus}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.DEBIT_CARD_TRACK) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRACK_DATE, "ACTION", MSISDN, CNIC, CARD_TYPE, CARD_CAT, ORDER_ID, ORDER_DATE, SUPL_CARD_NUMBER, SUPL_CARD_CNIC, TID, STATUS, CHANNEL) 
                VALUES(${data.trackDate}, '${data.action}', ${data.msisdn}, '${data.cnic}', '${data.cardType}', '${data.cardCategory}', ${data.orderID}, '${data.transactionTime}', ${data.suplCardNum}, '${data.suplCardCnic}', ${data.TID}, '${data.transactionStatus}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.CREATE_CARD_PIN) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("ACTION", CUST_MSISDN, CUST_CNIC, "DATE", PIN_CREATED_BEFORE, CARD_NUM, CARD_TYPE, CARD_CATEGORY, SUPL_CARD_NUM, SUPL_CARD_CNIC, TID, STATUS, CHANNEL)
                VALUES('${data.action}', ${data.msisdn}, '${data.cnic}', '${data.transactionTime}', '${data.pinCreated}', '${data.cardNum}', '${data.cardType}', '${data.cardCategory}', ${data.suplCardNum}, '${data.suplCardCnic}', ${data.TID}, '${data.transactionStatus}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.CARD_LINKING) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, TRANS_DATE, DELINK_STATUS, RETRIEVE_REF, CHANNEL)
                VALUES(${data.msisdn}, TIMESTAMP_FORMAT('${data.transDate}','YYYY-MM-DD HH24:MI:SS'), '${data.isDelinkSuccess}', ${data.retrieveRef}, '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.CARD_DELINK) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MSISDN, TRANS_DATE, CHANNEL)
                VALUES(${data.msisdn}, TIMESTAMP_FORMAT('${data.transDate}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.INVITEANDEARN) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (INVITER_MSISDN, INVITER_NAME, RECEIVER_NUM, RECEIVER_NAME, REQ_CATEGORY, ACCOUNT_STATUS, REQ_STATUS, ACCEPT_DATE, ACCEPT_TIME, MODULE, REQ_CHANNEL, REGISTR_CHANNEL, AMOUNT_POSTED, AMOUNTPOSTING_DATE, AMOUNTPOSTING_TIME, MESSAGE, INVITE_DATE, INVITE_TIME, CHANNEL)
                VALUES(${data.inviterMsisdn}, '${data.inviterName}', ${data.receiverMsisdn}, '${data.receiverName}', '${data.reqCategory}', '${data.accountStatus}', '${data.reqStatus}', ${data.acceptDate}, ${data.acceptTime}, '${data.module}', '${data.reqChannel}', '${data.registerChannel}', ${data.amount}, '${data.amountPostedDate}', '${data.amountPostedTime}', '${data.message}', ${data.inviteDate}, ${data.inviteTime}, '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.SCHEDULED_TRANSACTIONS) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (INITIATOR_MSISDN, TRANS_TYPE, TRANS_AMOUNT, RECEIVER_MSISDN, TRANS_FREQUENCY, TRANS_STATUS, REPEAT_TRANS_DURATION, CHANNEL)
                VALUES(${data.initiatorMsisdn}, '${data.transType}', ${data.amount}, ${data.receiverMsisdn}, ${data.transFrequency}, '${data.transactionStatus}', '${data.repeatTransDuration}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.ACCOUNT_UPGRADE) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", CUST_MSISDN, CUST_CNIC, NADRA_RESPONSE, FINGERPRINT_TIME, APPUSER_DETAIL, NADRA_ERROR, CHANNEL, MERCH_MSISDN, MERCH_NIC, PERSONAL_NAME, BIUSINESS_NAME)
                VALUES(TIMESTAMP_FORMAT('${data.date}','YYYY-MM-DD HH24:MI:SS'), ${data.msisdn}, '${data.cnic}', '${data.nadraResponse}', '${data.fingerprintTime}', '${data.appUserDetails}', '${data.nadraError}', '${data.channel}', ${data.merchMsisdn}, '${data.merchNic}', '${data.personalName}', '${data.businessName}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.MOVIE_TICKET) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (BOOK_DATE, MOVIE_DATE, MSISDN, CNIC, EMAIL, TRANS_ID, CINEMA, SEAT_CLASS, CITY, SEATS, PRICE, REVENUE, TRANS_STATUS, AMOUNT, CHANNEL)
                VALUES(TIMESTAMP_FORMAT('${data.bookDate}','YYYY-MM-DD HH24:MI:SS'), TIMESTAMP_FORMAT('${data.movieDate}','YYYY-MM-DD HH24:MI:SS'), ${data.msisdn}, '${data.cnic}', '${data.email}', ${data.TID}, '${data.cinema}', '${data.seatClass}', '${data.city}', ${data.seats}, ${data.price}, ${data.revenue}, '${data.transStatus}', ${data.amount}, '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.DOORSTEP_CASHIN) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} ("DATE", AMOUNT, ADDRESS, CITY, LAT_LONG, REQUEST_STATUS, CUST_MSISDN, RIDER_NAME, RIDER_MSISDN, CHANNEL)
                VALUES(TIMESTAMP_FORMAT('${data.date}','YYYY-MM-DD HH24:MI:SS'), ${data.amount}, '${data.address}', '${data.city}', ${data.lat}, '${data.reqStatus}', ${data.custMsisdn}, '${data.riderName}', ${data.riderMsisdn}, '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.CAREEM_VOUCHER) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (TRANS_DATE, AMOUNT, MSISDN, TRANS_ID, STATUS, CHANNEL)
                VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.amount}, ${data.msisdn}, ${data.TID}, '${data.status}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.PAYON_REG_LINK) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MOBILE_NUMBER, PAYON_USERNAME, ACTIVITY_DATE, CHANNEL)
                VALUES(${data.msisdn}, '${data.payUsername}', TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function (err) { });
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if (tableName === config.reportingDBTables.PAYON_TRANSACTIONS) {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`select * from ${schema}.${tableName} where TRANS_ID = ?;`);
                let result = stmt.executeSync([data.TID]);
                let resultArray = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
                // if record does't exist insert new record, otherwise update existing record
                if (resultArray.length == 0) {
                    const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.${tableName} (MOBILE_NUMBER, PAYON_USERNAME, PKR_AMOUNT, USD_AMOUNT, EXCHANGE_RATE, CURRENCY, DESCRIPTION, ACTIVITY_DATE, MONETA_STATUS, CHANNEL, TRANS_ID)
                    VALUES(${data.msisdn}, '${data.payUsername}', ${data.pkrAmount}, ${data.usdAmount}, ${data.exchangeRate}, '${data.currency}', '${data.description}', TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), '${data.monetaStatus}', '${data.channel}', ${data.TID});`);
                    stmt.executeSync();
                    stmt.closeSync();
                    conn.close(function (err) { });
                    console.log("insert done");
                } else {
                    const stmt = conn.prepareSync(`UPDATE ${schemaName}.${tableName} SET MOBILE_NUMBER=${data.msisdn}, PAYON_USERNAME='${data.payUsername}', PKR_AMOUNT=${data.pkrAmount}, USD_AMOUNT=${data.usdAmount}, EXCHANGE_RATE=${data.exchangeRate}, CURRENCY='${data.currency}', DESCRIPTION='${data.description}', ACTIVITY_DATE=TIMESTAMP_FORMAT('${data.activityDate}','YYYY-MM-DD HH24:MI:SS'), MONETA_STATUS='${data.monetaStatus}', CHANNEL='${data.channel}' WHERE TRANS_ID=${data.TID};`);
                    stmt.executeSync();
                    stmt.closeSync();
                    conn.close(function (err) { });
                    console.log("Record updated");
                }

            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

    }

    async getLatestAccountBalanceValue(customerMobileNumer, endDate) {

        try {

            let concatenatResult;
            let conn = await open(cn);
            const stmt = conn.prepareSync(`select * from statements.ACCOUNTSTATEMENT where MSISDN = ${customerMobileNumer} And date(TRX_DATETIME) <= '${endDate}' order by TRX_DATETIME desc limit 1`);
            let result = stmt.executeSync();
            let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            let sumBalance = 0.00;
            let sumCredit = 0.00;
            let sumDebit = 0.00;
            console.log(resultArrayFormat, " resultArrayFormat", result, `select * from statements.ACCOUNTSTATEMENT where MSISDN = ${customerMobileNumer} And date(TRX_DATETIME) <= '${endDate}' order by TRX_DATETIME desc limit 1`)
            // console.log();
            resultArrayFormat.forEach((row) => {
                sumDebit += parseFloat(row[row.length - 3]);
                sumCredit += parseFloat(row[row.length - 2]);
                sumBalance += parseFloat(row[row.length - 1]);
            });
            resultArrayFormat.push(["Total", "", "", "", "", "", sumDebit.toFixed(2), sumCredit.toFixed(2), sumBalance.toFixed(2)]);
            concatenatResult = resultArrayFormat.join('\n');
            // console.log("the result of database" + concatenatResult);
            result.closeSync();
            stmt.closeSync();
            conn.close(function (err) { });
            return concatenatResult;

        } catch (err) {
            logger.error('Database connection error' + err);
            return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
        }
    }


    async getValue(customerMobileNumer, endDate, startDate) {

        try {

            let concatenatResult;
            let conn = await open(cn);
            const stmt = conn.prepareSync(`select * from statements.ACCOUNTSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ?;`);
            let result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
            let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            let sumBalance = 0.00;
            let sumCredit = 0.00;
            let sumDebit = 0.00;
            // console.log();
            resultArrayFormat.forEach((row) => {
                sumDebit += parseFloat(row[row.length - 3]);
                sumCredit += parseFloat(row[row.length - 2]);
                sumBalance += parseFloat(row[row.length - 1]);
            });
            resultArrayFormat.push(["Total", "", "", "", "", "", sumDebit.toFixed(2), sumCredit.toFixed(2), sumBalance.toFixed(2)]);
            concatenatResult = resultArrayFormat.join('\n');
            // console.log("the result of database" + concatenatResult);
            result.closeSync();
            stmt.closeSync();
            conn.close(function (err) { });
            return concatenatResult;

        } catch (err) {
            logger.error('Database connection error' + err);
            return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
        }
    }

    async getValueArray(customerMobileNumer, endDate, startDate) {

        try {

            logger.info({ event: 'Entered function', functionName: 'getValueArray in class DatabaseConn' });
            const conn = await open(cn);
            const stmt = conn.prepareSync(`Select * from statements.ACCOUNTSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ? ;`);
            const result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
            const arrayResult = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            result.closeSync();
            stmt.closeSync();
            conn.close();
            // console.log(`the resulted array ${JSON.stringify(arrayResult)}`);

            logger.info({ event: 'Exited function', functionName: 'getValueArray in class DatabaseConn' });
            return arrayResult;

        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'getValueArray in class DatabaseConn', 'arguments': { customerMobileNumer, endDate, startDate }, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });
            throw new Error(`Database error ${error}`);
        }
    }

    async getTaxValueArray(customerMobileNumer, endDate, startDate) {

        try {
            const con = "DATABASE=REPDB;HOSTNAME=10.50.20.124;PORT=60000;PROTOCOL=TCPIP;UID=jcapprepdb;PWD=repdb@1234;";
            const schemaCon = config.IBMDB2_Test.schema;
            console.log("entered getTaxValueArray: ", customerMobileNumer, startDate, endDate, cn, 'statements')

            const conn = await open(cn);
            const stmt = conn.prepareSync(`select * from statements.TAXSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ?;`);
            const result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
            const arrayResult = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            result.closeSync();
            stmt.closeSync();
            conn.close(function (err) {
                console.log("CONNECTION ERROR: ", ERR)
            });
            console.log("Exited getTaxValueArray: ", arrayResult)
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
            console.log("insert done");
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
            console.log("insert done");
            return;

        } catch (err) {
            logger.error('Database connection error' + err);
            return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
        }
    }

    async addIncomingTransaction(dataPayload) {
        logger.info({ event: 'Entered function', functionName: 'addIncomingTransaction in class DatabaseConn' });
        try {
            let conn = await open(cn);
            const stmt = conn.prepareSync(`INSERT INTO ${schema}.INCOMMING_IBFT (TRXID_EASYPAISA, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, RECEIVER_MSISDN, RECEIVER_CNIC, RECEIVER_NAME, ID_LEVEL, REGION, CITY, ADDRESS, AMOUNT, TRX_STATUS, REVERSE_STATUS, SENDER_NAME, SENDER_BANK, SENDER_ACCOUNT, REVERSED_TRX_ID, REVERSED_REASON, FAILURE_REASON, FEE, FED, STAN, CURRENT_BALANCE, CHANNEL, FINID_EASYPAISA, TRANS_OBJECTIVE) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`);
            stmt.executeSync([dataPayload.transactionIDEasyPaisa, dataPayload.transactionIDEasyJazzcash, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.receiverMsisdn, dataPayload.receiverCnic, dataPayload.receiverName, dataPayload.identityLevel, dataPayload.region, dataPayload.city, dataPayload.address, dataPayload.amount, dataPayload.transactionStatus,
            dataPayload.reversalStatus, dataPayload.senderName, dataPayload.senderBankName, dataPayload.senderAccount, dataPayload.reversedTrasactionID, dataPayload.reversedReason, dataPayload.reasonOfFailure, dataPayload.fee, dataPayload.fed, dataPayload.stan, dataPayload.currentBalance, dataPayload.channel, dataPayload.financialIDEasyPaisa,
            dataPayload.paymentPurpose
            ]);
            stmt.closeSync();
            conn.close(function (err) { });
            console.log("insert done");
            logger.info({ event: 'Existed function', functionName: 'addIncomingTransaction in class DatabaseConn' });
            return true;
        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'addIncomingTransaction in class DatabaseConn', 'arguments': dataPayload, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'addIncomingTransaction' });
            return null;
        }
    }

    async addOutgoingTransaction(dataPayload) {
        logger.info({ event: 'Entered function', functionName: 'addOutgoingTransaction in class DatabaseConn' });
        try {
            let conn = await open(cn);
            const stmt = conn.prepareSync(`INSERT INTO ${schema}.OUTGOING_IBFT (TRX_OBJECTIVE, TRXID_EASYPAISA, FINID_JAZZCASH, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, INITIATOR_REGION, SENDER_NAME, AMOUNT, TRX_STATUS, FAILURE_REASON, REVERSAL_STATUS, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, CHANNEL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`);
            stmt.executeSync([dataPayload.transactionObjective, dataPayload.transactionIDEasyPaisa, dataPayload.financialIDJazzcash, dataPayload.transactionIDJazzcash, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.beneficiaryBankAccountTitle, dataPayload.beneficiaryBankName, dataPayload.senderMsisdn, dataPayload.beneficiaryBankAccountNumber, dataPayload.senderLevel, dataPayload.senderCnic, dataPayload.receiverMsisdn, dataPayload.initiatorMsisdn, dataPayload.initiatorCity,
            dataPayload.initiatorRegion, dataPayload.senderName, dataPayload.amount,
            dataPayload.transactionStatus, dataPayload.reasonOfFailure, dataPayload.reversalStatus, dataPayload.fee, dataPayload.fed,
            dataPayload.commission, dataPayload.wht, dataPayload.stan,
            dataPayload.currentBalance, dataPayload.channel
            ]);
            stmt.closeSync();
            conn.close(function (err) { });
            console.log("insert done");
            logger.info({ event: 'Existed function', functionName: 'addOutgoingTransaction in class DatabaseConn' });
            return true;

        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'addOutgoingTransaction in class DatabaseConn', 'arguments': dataPayload, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'addOutgoingTransaction' });
            return null;
        }
    }

    async updateIncomingTransaction(dataPayload) {
        logger.info({ event: 'Entered function', functionName: 'updateIncomingTransaction in class DatabaseConn' });
        console.log(dataPayload);
        try {
            let conn = await open(cn);
            const stmt = conn.prepareSync(`UPDATE ${schema}.INCOMMING_IBFT SET TRXID_JAZZCASH = ?, FINID_EASYPAISA = ?, TRANS_OBJECTIVE = ?, TRX_DATE = ?, TRX_TIME = ?, TRX_STATUS = ?, FEE = ?, FED = ?, CURRENT_BALANCE = ?, FAILURE_REASON = ? WHERE TRXID_EASYPAISA = ?;`);
            stmt.executeSync([dataPayload.transactionIDEasyJazzcash, dataPayload.financialIDEasyPaisa, dataPayload.paymentPurpose, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.transactionStatus, dataPayload.fee, dataPayload.fed, dataPayload.currentBalance, dataPayload.reasonOfFailure, dataPayload.transactionIDEasyPaisa]);
            stmt.closeSync();
            conn.close(function (err) { });
            console.log("insert done");
            logger.info({ event: 'Exited function', functionName: 'updateIncomingTransaction in class DatabaseConn' });
            return true;
        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'updateIncomingTransaction in class DatabaseConn', 'arguments': dataPayload, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'updateIncomingTransaction' });
            return null;
        }
    }

    async updateOutgoingTransaction(dataPayload) {
        logger.info({ event: 'Entered function', functionName: 'updateOutgoingTransaction in class DatabaseConn' });
        console.log(dataPayload);
        try {
            let conn = await open(cn);

            let stmt;

            if (dataPayload.beneficiaryBankAccountTitle) {
                stmt = conn.prepareSync(`UPDATE ${schema}.OUTGOING_IBFT SET TRXID_EASYPAISA = ?, TRXID_JAZZCASH = ?, TRX_DATE = ?, TRX_TIME = ?, AMOUNT = ?, TRX_STATUS = ?, FEE = ?, FED = ?, COMMISSION = ?, WHT = ?, CURRENT_BALANCE = ?, STAN = ?, BENEFICIARY_NAME = ?, FAILURE_REASON = ?, REVERSAL_STATUS = ? WHERE FINID_JAZZCASH = ?;`);
                stmt.executeSync([dataPayload.transactionIDEasyPaisa, dataPayload.transactionIDJazzcash, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.amount, dataPayload.transactionStatus, dataPayload.fee, dataPayload.fed, dataPayload.commission, dataPayload.wht, dataPayload.currentBalance, dataPayload.stan, dataPayload.beneficiaryBankAccountTitle, dataPayload.reasonOfFailure, dataPayload.reversalStatus, dataPayload.financialIDJazzcash]);
            } else {
                stmt = conn.prepareSync(`UPDATE ${schema}.OUTGOING_IBFT SET TRXID_EASYPAISA = ?, TRXID_JAZZCASH = ?, TRX_DATE = ?, TRX_TIME = ?, AMOUNT = ?, TRX_STATUS = ?, FEE = ?, FED = ?, COMMISSION = ?, WHT = ?, CURRENT_BALANCE = ?, STAN = ?, FAILURE_REASON = ?, REVERSAL_STATUS = ? WHERE FINID_JAZZCASH = ?;`);
                stmt.executeSync([dataPayload.transactionIDEasyPaisa, dataPayload.transactionIDJazzcash, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.amount, dataPayload.transactionStatus, dataPayload.fee, dataPayload.fed, dataPayload.commission, dataPayload.wht, dataPayload.currentBalance, dataPayload.stan, dataPayload.reasonOfFailure, dataPayload.reversalStatus, dataPayload.financialIDJazzcash]);
            }

            stmt.closeSync();
            conn.close(function (err) { });
            console.log("insert done");
            logger.info({ event: 'Exited function', functionName: 'updateOutgoingTransaction in class DatabaseConn' });
            return true;
        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'updateOutgoingTransaction in class DatabaseConn', 'arguments': dataPayload, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'updateOutgoingTransaction' });
            return null;
        }
    }

    async getIncomingTransactions(startDate, endDate) {
        logger.info({ event: 'Entered function', functionName: 'getIncomingTransactions in class DatabaseConn' });
        try {

            let conn = await open(cn);
            const stmt = conn.prepareSync(`select * from ${schema}.INCOMMING_IBFT WHERE TRX_DATE BETWEEN ? AND ?;`);
            let result = stmt.executeSync([startDate, endDate]);
            let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.

            result.closeSync();
            stmt.closeSync();
            conn.close(function (err) { });
            logger.info({ event: 'Exited function', functionName: 'getIncomingTransactions in class DatabaseConn' });

            return resultArrayFormat;

        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'getIncomingTransactions in class DatabaseConn', 'arguments': { startDate, endDate }, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'getIncomingTransactions' });
            return null;
        }
    }

    async getOutgoingTransactions(startDate, endDate) {
        logger.info({ event: 'Entered function', functionName: 'getOutgoingTransactions in class DatabaseConn' });
        try {

            let conn = await open(cn);
            const stmt = conn.prepareSync(`select * from ${schema}.OUTGOING_DIRECT_IBFT WHERE TRX_DATE BETWEEN ? AND ?;`);
            let result = stmt.executeSync([startDate, endDate]);
            let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.

            result.closeSync();
            stmt.closeSync();
            conn.close(function (err) { });
            logger.info({ event: 'Exited function', functionName: 'getOutgoingTransactions in class DatabaseConn' });

            return resultArrayFormat;

        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'getOutgoingTransactions in class DatabaseConn', 'arguments': { startDate, endDate }, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'getOutgoingTransactions' });
            return null;
        }
    }

}

export default new DatabaseConn();