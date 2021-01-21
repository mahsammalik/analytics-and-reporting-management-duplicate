import { open } from 'ibm_db';
import responseCodeHandler from './responseCodeHandler';
import { logger } from '/util/';
import moment from 'moment';

const cn = process.env.DB2Connection || config.IBMDB2_Dev.connectionString;
const schema = config.IBMDB2_Dev.schema;

class DatabaseConn {

    async insertTransactionHistory(schemaName, tableName, data) {
        if(tableName === config.reportingDBTables.COMMON_OUTGOING_IBFT)
        {
            try {
                let conn = await open(cn);
                // const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.COMMON_OUTGOING_IBFT 
                // (TRX_OBJECTIVE, TRXID_JAZZCASH, TRXID_EASYPAISA, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, SENDER_NAME, INITIATOR_REGION, AMOUNT, TRX_STATUS, FAILURE_REASON, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, REVERSAL_STATUS, CHANNEL, TRANS_OBJECTIVE, FINID_JAZZCASH) 
                // VALUES('${data.paymentPurpose}' , ${data.transactionIDEasyJazzcash}, '${data.transactionIDEasyPaisa}' , '${data.transactionDate}' , '${data.transactionTime}' , ${data.receiverMsisdn} , '${data.receiverCnic}' , '${data.receiverName}' , '${data.identityLevel}' , '${data.region}' , '${data.city}' , '${data.address}' , ${data.amount} , '${data.transactionStatus}' , '${data.reversalStatus}' , '${data.senderName}' , '${data.senderBankName}' , '${data.senderAccount}' , '${data.reversedTrasactionID}' , '${data.reversedReason}' , '${data.reasonOfFailure}' , ${data.fee} , ${data.fed} , '${data.stan}' , ${data.currentBalance} , '${data.channel}' , '${data.financialIDEasyPaisa}');`);
                // stmt.executeSync();
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.COMMON_OUTGOING_IBFT (TRX_OBJECTIVE, TRXID_EASYPAISA, FINID_JAZZCASH, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, INITIATOR_REGION, SENDER_NAME, AMOUNT, TRX_STATUS, FAILURE_REASON, REVERSAL_STATUS, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, CHANNEL, TRANS_OBJECTIVE) VALUES('${data.trxObjective}', '${data.transactionIDEasyPaisa}', '${data.financialIDJazzcash}', '${data.transactionIDJazzcash}', '${data.transactionDate}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.beneficiaryBankAccountTitle}', '${data.beneficiaryBankName}', '${data.senderMsisdn}', '${data.beneficiaryBankAccountNumber}', '${data.senderLevel}', '${data.senderCnic}', '${data.receiverMsisdn}', '${data.initiatorMsisdn}', '${data.initiatorCity}',
                    '${data.initiatorRegion}','${data.senderName}', ${data.amount}, 
                    '${data.transactionStatus}', '${data.reasonOfFailure}', '${data.reversalStatus}', ${data.fee}, ${data.fed},
                    ${data.commission}, ${data.wht}, '${data.stan}',
                    ${data.currentBalance}, '${data.channel}', '${data.transactionObjective}');`);
                stmt.executeSync();
                // const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.COMMON_INCOMMING_IBFT
                // (TRXID_EASYPAISA, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, RECEIVER_MSISDN, RECEIVER_CNIC, RECEIVER_NAME, ID_LEVEL, REGION, CITY, ADDRESS, AMOUNT, TRX_STATUS, REVERSE_STATUS, SENDER_NAME, SENDER_BANK, SENDER_ACCOUNT, REVERSED_TRX_ID, REVERSED_REASON, FAILURE_REASON, FEE, FED, STAN, CURRENT_BALANCE, CHANNEL, FINID_EASYPAISA, TRANS_OBJECTIVE)
                // VALUES('${data.transactionIDEasyPaisa}', '${data.transactionIDEasyJazzcash}', '${data.transactionDate}', '${data.transactionTime}', ${data.receiverMsisdn}, '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', 0, 0, '', 0, '', '', '');
                // `);
                // stmt.executeSync();
                stmt.closeSync();
                conn.close(function(err) {});
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if(tableName === config.reportingDBTables.COMMON_QR_PAYMENT)
        {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.COMMON_QR_PAYMENT (CHANNEL, MERCH_NAME, REVERS_TID, REVIEWS, THIRDPARTY_TID, TID, TILL_PAYMENT, TIP_AMOUNT, CONSUEMER_BALANCE, CUST_MSISDN, "DATE", FEE_AMOUNT, MERCH_ACCOUNT, MERCH_BALANCE, MERCH_BANK, MERCH_CATEGORY_CODE, MERCH_CATEGORY_TYPE, MERCH_ID, PAID_VIA, QR_CODE, QR_TYPE, RATING, TRANS_AMOUNT, TRANS_STATUS) VALUES('${data.channel}', '${data.merchantName}', ${data.reverseTID}, '${data.reviews}', ${data.thirdPartTID}, ${data.TID}, ${data.tilPayment}, ${data.tipAmount}, ${data.consumerBalance}, ${data.custMsisdn}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.fee}, ${data.merchAccount}, ${data.merchBalance}, '${data.merchantBank}',
                '${data.merchCategoryCode}','${data.merchCategoryType}', ${data.merchID}, 
                '${data.paidVia}', '${data.qrCode}', '${data.qrType}', '${data.rating}', ${data.transAmount},
                '${data.transactionStatus}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function(err) {});
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if(tableName === config.reportingDBTables.COMMON_MOBILE_BUNDLE)
        {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.COMMON_MOBILE_BUNDLE (AMOUNT, BUNDLE_NAME, BUNDLE_TYPE, CHANNEL, INITIATOR_MSISDN, NETWORK, TARGET_MSISDN, TRANS_DATE, TRANS_ID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`);
                stmt.executeSync([data.amount, data.bundleName, data.bundleType, data.channel, data.initiatorMsisdn, data.network, data.targetMsisdn, data.transactionDate, data.TID]);
                stmt.closeSync();
                conn.close(function(err) {});
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if(tableName === config.reportingDBTables.COMMON_DONATION)
        {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.COMMON_DONATION (AMOUNT, CHANNEL, "DATE", EMAIL, FAIL_REASON, FUND, MSISDN, ORGANIZATION, STATUS, TRANS_ID) VALUES(${data.amount}, '${data.channel}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.email}', '${data.failureReason}', '${data.fund}', ${data.msisdn}, '${data.organization}', '${data.transactionStatus}',${data.TID});`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function(err) {});
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if(tableName === config.reportingDBTables.COMMON_BUS_TICKET)
        {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.COMMON_BUS_TICKET (AMOUNT, BOOKING_DATE, BOOKING_ID, CHANNEL, CNIC, DESTINATION, DISCOUNT, EMAIL, FEE, GENDER, MSISDN, ORIGIN, ORIG_PRICE, PRICE, PROMO, SEATS, SEAT_NUMBER, SERVICE, STATUS, STATUS_REASON, TRANS_ID, TRAVEL_DATE) 
                VALUES(${data.amount}, TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.bookingID}, '${data.channel}', '${data.cnic}', '${data.destination}', '${data.discount}', '${data.email}', ${data.fee}, '${data.gender}', ${data.msisdn}, '${data.origin}', ${data.originPrice}, ${data.price}, '${data.promo}', '${data.seats}', '${data.seatNumber}', '${data.service}', '${data.transactionStatus}', '${data.statusReason}', ${data.TID}, ${data.travelDate});`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function(err) {});
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if(tableName === config.reportingDBTables.COMMON_EVENT_TICKET)
        {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.COMMON_EVENT_TICKET (AMOUNT, BOOKING_ID, BOOK_DATE, CHANNEL, CITY, CNIC, DISCOUNT, EMAIL, EVENT, EVENT_DATE, FAIL_REASON, MSISDN, NUMBER_OF_SEATS, PARTNER, PRICE, PROMO_AMOUNT, PROMO_APPLIED, REVENUE, SEAT_CLASS, SUCCESSFUL, TRANS_ID) 
                VALUES(${data.amount}, '${data.bookingID}', TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${data.channel}', '${data.city}', '${data.cnic}', ${data.discount}, '${data.email}', '${data.event}', ${data.eventDate}, '${data.failReason}', ${data.msisdn}, ${data.numSeats}, '${data.partner}', ${data.price}, ${data.promoAmount}, '${data.promoApplied}', ${data.revenue}, '${data.seatClass}', '${data.successfull}', ${data.TID});`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function(err) {});
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }

        if(tableName === config.reportingDBTables.CONSUMER_DARAZ_WALLET)
        {
            try {
                let conn = await open(cn);
                const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.CONSUMER_DARAZ_WALLET ("DATE", TRANS_ID, DARAZ_WALLET_NUM, DARAZ_WALLET_OWNER, DARAZ_WALLET_EMAIL, BALANCE_BEFORE_TRANS, PROMO_CODE, PROMO_CODE_AMOUNT, ACTUAL_AMOUNT, STATUS, FAILURE_REASON, MSISDN, USER_EMAIL, CHANNEL) 
                VALUES(TIMESTAMP_FORMAT('${data.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${data.TID}, ${data.walletNumber}, '${data.walletOwner}', '${data.walletEmail}', ${data.balanceBefore}, '${data.promoCode}', ${data.promoCodeAmount}, ${data.actualAmount}, '${data.status}', '${data.failureReason}', ${data.msisdn}, '${data.userEmail}', '${data.channel}');`);
                stmt.executeSync();
                stmt.closeSync();
                conn.close(function(err) {});
                console.log("insert done");
            } catch (err) {
                logger.error('Database connection error' + err);
                return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
            }
        }
    }

    async getValue(customerMobileNumer, endDate, startDate) {

        try {

            let concatenatResult;
            let conn = await open(cn);
            const stmt = conn.prepareSync(`select * from ${schema}.ACCOUNTSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ?;`);
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
            conn.close(function(err) {});
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
            const stmt = conn.prepareSync(`Select * from ${schema}.ACCOUNTSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ? ;`);
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
            const conn = await open(cn);
            const stmt = conn.prepareSync(`select * from ${schema}.TAXSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ?;`);
            const result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
            const arrayResult = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
            result.closeSync();
            stmt.closeSync();
            conn.close(function(err) {});
            // console.log('the resulted array ' + arrayResult);
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
            conn.close(function(err) {});
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
            conn.close(function(err) {});
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
            const stmt = conn.prepareSync(`INSERT INTO ${schema}.COMMON_INCOMMING_IBFT (TRXID_EASYPAISA, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, RECEIVER_MSISDN, RECEIVER_CNIC, RECEIVER_NAME, ID_LEVEL, REGION, CITY, ADDRESS, AMOUNT, TRX_STATUS, REVERSE_STATUS, SENDER_NAME, SENDER_BANK, SENDER_ACCOUNT, REVERSED_TRX_ID, REVERSED_REASON, FAILURE_REASON, FEE, FED, STAN, CURRENT_BALANCE, CHANNEL, FINID_EASYPAISA, TRANS_OBJECTIVE) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`);
            stmt.executeSync([dataPayload.transactionIDEasyPaisa, dataPayload.transactionIDEasyJazzcash, dataPayload.transactionDate,  dataPayload.transactionTime, dataPayload.receiverMsisdn, dataPayload.receiverCnic, dataPayload.receiverName, dataPayload.identityLevel, dataPayload.region, dataPayload.city, dataPayload.address, dataPayload.amount, dataPayload.transactionStatus,
                dataPayload.reversalStatus, dataPayload.senderName, dataPayload.senderBankName, dataPayload.senderAccount, dataPayload.reversedTrasactionID, dataPayload.reversedReason, dataPayload.reasonOfFailure, dataPayload.fee, dataPayload.fed, dataPayload.stan, dataPayload.currentBalance, dataPayload.channel, dataPayload.financialIDEasyPaisa, 
                dataPayload.paymentPurpose
            ]);
            stmt.closeSync();
            conn.close(function(err) {});
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
            const stmt = conn.prepareSync(`INSERT INTO ${schema}.COMMON_OUTGOING_IBFT (TRX_OBJECTIVE, TRXID_EASYPAISA, FINID_JAZZCASH, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, INITIATOR_REGION, SENDER_NAME, AMOUNT, TRX_STATUS, FAILURE_REASON, REVERSAL_STATUS, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, CHANNEL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`);
            stmt.executeSync([dataPayload.transactionObjective, dataPayload.transactionIDEasyPaisa, dataPayload.financialIDJazzcash, dataPayload.transactionIDJazzcash, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.beneficiaryBankAccountTitle, dataPayload.beneficiaryBankName, dataPayload.senderMsisdn, dataPayload.beneficiaryBankAccountNumber, dataPayload.senderLevel, dataPayload.senderCnic, dataPayload.receiverMsisdn, dataPayload.initiatorMsisdn, dataPayload.initiatorCity,
                dataPayload.initiatorRegion,dataPayload.senderName, dataPayload.amount, 
                dataPayload.transactionStatus, dataPayload.reasonOfFailure, dataPayload.reversalStatus, dataPayload.fee, dataPayload.fed,
                dataPayload.commission, dataPayload.wht, dataPayload.stan,
                dataPayload.currentBalance, dataPayload.channel
            ]);
            stmt.closeSync();
            conn.close(function(err) {});
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
            const stmt = conn.prepareSync(`UPDATE ${schema}.COMMON_INCOMMING_IBFT SET TRXID_JAZZCASH = ?, FINID_EASYPAISA = ?, TRANS_OBJECTIVE = ?, TRX_DATE = ?, TRX_TIME = ?, TRX_STATUS = ?, FEE = ?, FED = ?, CURRENT_BALANCE = ?, FAILURE_REASON = ? WHERE TRXID_EASYPAISA = ?;`);
            stmt.executeSync([dataPayload.transactionIDEasyJazzcash, dataPayload.financialIDEasyPaisa, dataPayload.paymentPurpose, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.transactionStatus, dataPayload.fee, dataPayload.fed, dataPayload.currentBalance, dataPayload.reasonOfFailure, dataPayload.transactionIDEasyPaisa]);
            stmt.closeSync();
            conn.close(function(err) {});
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
                stmt = conn.prepareSync(`UPDATE ${schema}.COMMON_OUTGOING_IBFT SET TRXID_EASYPAISA = ?, TRXID_JAZZCASH = ?, TRX_DATE = ?, TRX_TIME = ?, AMOUNT = ?, TRX_STATUS = ?, FEE = ?, FED = ?, COMMISSION = ?, WHT = ?, CURRENT_BALANCE = ?, STAN = ?, BENEFICIARY_NAME = ?, FAILURE_REASON = ?, REVERSAL_STATUS = ? WHERE FINID_JAZZCASH = ?;`);
                stmt.executeSync([dataPayload.transactionIDEasyPaisa, dataPayload.transactionIDJazzcash, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.amount, dataPayload.transactionStatus, dataPayload.fee, dataPayload.fed, dataPayload.commission, dataPayload.wht, dataPayload.currentBalance, dataPayload.stan, dataPayload.beneficiaryBankAccountTitle, dataPayload.reasonOfFailure, dataPayload.reversalStatus, dataPayload.financialIDJazzcash]);    
            } else {
                stmt = conn.prepareSync(`UPDATE ${schema}.COMMON_OUTGOING_IBFT SET TRXID_EASYPAISA = ?, TRXID_JAZZCASH = ?, TRX_DATE = ?, TRX_TIME = ?, AMOUNT = ?, TRX_STATUS = ?, FEE = ?, FED = ?, COMMISSION = ?, WHT = ?, CURRENT_BALANCE = ?, STAN = ?, FAILURE_REASON = ?, REVERSAL_STATUS = ? WHERE FINID_JAZZCASH = ?;`);
                stmt.executeSync([dataPayload.transactionIDEasyPaisa, dataPayload.transactionIDJazzcash, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.amount, dataPayload.transactionStatus, dataPayload.fee, dataPayload.fed, dataPayload.commission, dataPayload.wht, dataPayload.currentBalance, dataPayload.stan, dataPayload.reasonOfFailure, dataPayload.reversalStatus, dataPayload.financialIDJazzcash]);    
            }
           
            stmt.closeSync();
            conn.close(function(err) {});
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
            const stmt = conn.prepareSync(`select * from ${schema}.COMMON_INCOMMING_IBFT WHERE TRX_DATE BETWEEN ? AND ?;`);
            let result = stmt.executeSync([startDate, endDate]);
            let resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.

            result.closeSync();
            stmt.closeSync();
            conn.close(function(err) {});
            logger.info({ event: 'Exited function', functionName: 'getIncomingTransactions in class DatabaseConn' });

            return resultArrayFormat;

        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'getIncomingTransactions in class DatabaseConn', 'arguments': {startDate, endDate}, 'error': error });
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
            conn.close(function(err) {});
            logger.info({ event: 'Exited function', functionName: 'getOutgoingTransactions in class DatabaseConn' });

            return resultArrayFormat;

        } catch (error) {
            logger.error({ event: 'Error  thrown', functionName: 'getOutgoingTransactions in class DatabaseConn', 'arguments': {startDate, endDate}, 'error': error });
            logger.info({ event: 'Exited function', functionName: 'getOutgoingTransactions' });
            return null;
        }
    }

}

export default new DatabaseConn();