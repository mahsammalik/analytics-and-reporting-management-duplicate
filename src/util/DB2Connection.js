import { open } from 'ibm_db';
import responseCodeHandler from './responseCodeHandler';
import { logger } from '/util/';
import moment from 'moment';

const cn = process.env.DB2Connection || config.IBMDB2.connectionString;
const schema = config.IBMDB2.schema;

class DatabaseConn {

    async insertTransactionHistory(schemaName, tableName, data) {
        if(tableName === config.reportingDBTables.OUTGOING_IBFT)
        {
            let initTransData = {};
            try { 
                logger.info({ event: 'Entered function', functionName: 'insertTransactionHistory in class DB2Connection - OUTGOING_IBFT'});
                console.log(data);

                if (data.Result.ResultCode == 0) {
                    initTransData.trxObjective = data.CustomObject?.purposeofRemittanceCode? data.CustomObject.purposeofRemittanceCode.split(',')[0].split('=')[1] : '';
                    initTransData.transactionObjective = data.CustomObject?.purposeofRemittanceCode? data.CustomObject.purposeofRemittanceCode.split(',')[2].split('=')[1] : '';
                    initTransData.financialIDJazzcash = data.Result.TransactionID;
                    initTransData.transactionIDJazzcash = '';

                    initTransData.transactionIDEasyPaisa = '';

                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
                    if (initTransData.transactionDate !== ''){
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
                    }
            
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || '';
                    if (initTransData.transactionTime !== ''){
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;      
                    }

                    initTransData.beneficiaryMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'ReceiverMSISDN';})?.Value || '';
                    initTransData.beneficiaryBankName = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'BankName';})?.Value || '';
                    
                    initTransData.senderMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'SenderMSISDN';})?.Value || '';
                    initTransData.beneficiaryBankAccountTitle = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'BankAccountTitle';})?.Value || '';
                    initTransData.beneficiaryBankAccount = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'BankAccountNumber';})?.Value || '';
                    initTransData.beneficiaryBankAccountNumber = initTransData.beneficiaryBankAccount;
                    
                    initTransData.senderLevel = data.CustomObject?.IdentityType || '';
                    initTransData.senderCnic = data.CustomObject.senderCNIC;
                    initTransData.senderName = data.CustomObject?.SenderAccountTitle || '';
            
                    initTransData.receiverMsisdn =   initTransData.beneficiaryMsisdn;
                    initTransData.initiatorMsisdn = initTransData.senderMsisdn;
                    initTransData.initiatorCity= '';
                    initTransData.initiatorRegion = '';

                    initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
                    initTransData.transactionStatus = 'Pending'; 

                    initTransData.reasonOfFailure = ''; 

                    initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
                    initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
                    initTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
                    initTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
                    
                    initTransData.reversalStatus = ''; 
                    
                    initTransData.stan = "";
                    initTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
                    initTransData.channel = data.Header.SubChannel;
    
                    console.log(JSON.stringify(initTransData));
                }
            }catch(err){
                logger.error({event: 'error -> insertTransactionHistory - OUTGOING_IBFT', error: {message:error.message, stack: error.stack}});
                //console.log(err);
            }

            if(initTransData != null) {
                try {
                    let conn = await open(cn);
                    // const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.OUTGOING_IBFT 
                    // (TRX_OBJECTIVE, TRXID_JAZZCASH, TRXID_EASYPAISA, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, SENDER_NAME, INITIATOR_REGION, AMOUNT, TRX_STATUS, FAILURE_REASON, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, REVERSAL_STATUS, CHANNEL, TRANS_OBJECTIVE, FINID_JAZZCASH) 
                    // VALUES('${initTransData.paymentPurpose}' , ${initTransData.transactionIDEasyJazzcash}, '${initTransData.transactionIDEasyPaisa}' , '${initTransData.transactionDate}' , '${initTransData.transactionTime}' , ${initTransData.receiverMsisdn} , '${initTransData.receiverCnic}' , '${initTransData.receiverName}' , '${initTransData.identityLevel}' , '${initTransData.region}' , '${initTransData.city}' , '${initTransData.address}' , ${initTransData.amount} , '${initTransData.transactionStatus}' , '${initTransData.reversalStatus}' , '${initTransData.senderName}' , '${initTransData.senderBankName}' , '${initTransData.senderAccount}' , '${initTransData.reversedTrasactionID}' , '${initTransData.reversedReason}' , '${initTransData.reasonOfFailure}' , ${initTransData.fee} , ${initTransData.fed} , '${initTransData.stan}' , ${initTransData.currentBalance} , '${initTransData.channel}' , '${initTransData.financialIDEasyPaisa}');`);
                    // stmt.executeSync();
                    const stmt = conn.prepareSync(`INSERT INTO ${schema}.OUTGOING_IBFT (TRX_OBJECTIVE, TRXID_EASYPAISA, FINID_JAZZCASH, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, INITIATOR_REGION, SENDER_NAME, AMOUNT, TRX_STATUS, FAILURE_REASON, REVERSAL_STATUS, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, CHANNEL, TRANS_OBJECTIVE) VALUES('${initTransData.trxObjective}', '${initTransData.transactionIDEasyPaisa}', '${initTransData.financialIDJazzcash}', '${initTransData.transactionIDJazzcash}', '${initTransData.transactionDate}', TIMESTAMP_FORMAT('${initTransData.transactionTime}','YYYY-MM-DD HH24:MI:SS'), '${initTransData.beneficiaryBankAccountTitle}', '${initTransData.beneficiaryBankName}', '${initTransData.senderMsisdn}', '${initTransData.beneficiaryBankAccountNumber}', '${initTransData.senderLevel}', '${initTransData.senderCnic}', '${initTransData.receiverMsisdn}', '${initTransData.initiatorMsisdn}', '${initTransData.initiatorCity}',
                        '${initTransData.initiatorRegion}','${initTransData.senderName}', ${initTransData.amount}, 
                        '${initTransData.transactionStatus}', '${initTransData.reasonOfFailure}', '${initTransData.reversalStatus}', ${initTransData.fee}, ${initTransData.fed},
                        ${initTransData.commission}, ${initTransData.wht}, '${initTransData.stan}',
                        ${initTransData.currentBalance}, '${initTransData.channel}', '${initTransData.transactionObjective}');`);
                    stmt.executeSync();
                    // const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.INCOMMING_IBFT
                    // (TRXID_EASYPAISA, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, RECEIVER_MSISDN, RECEIVER_CNIC, RECEIVER_NAME, ID_LEVEL, REGION, CITY, ADDRESS, AMOUNT, TRX_STATUS, REVERSE_STATUS, SENDER_NAME, SENDER_BANK, SENDER_ACCOUNT, REVERSED_TRX_ID, REVERSED_REASON, FAILURE_REASON, FEE, FED, STAN, CURRENT_BALANCE, CHANNEL, FINID_EASYPAISA, TRANS_OBJECTIVE)
                    // VALUES('${initTransData.transactionIDEasyPaisa}', '${initTransData.transactionIDEasyJazzcash}', '${initTransData.transactionDate}', '${initTransData.transactionTime}', ${initTransData.receiverMsisdn}, '', '', '', '', '', '', 0, '', '', '', '', '', '', '', '', 0, 0, '', 0, '', '', '');
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
        }

        if(tableName === config.reportingDBTables.QR_PAYMENT)
        {
            let initTransData = {};
            try { 
                logger.info({ event: 'Entered function', functionName: 'insertTransactionHistory in class DB2Connection - QR_PAYMENT'});
                console.log(data);

                if (data.Result.ResultCode == 0) {
                    initTransData.consumerBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
                    initTransData.channel = data.Header.SubChannel;
                    initTransData.custMsisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
                    if (initTransData.transactionDate !== ''){
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || '';
                    if (initTransData.transactionTime !== ''){
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;      
                    }
                    initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
                    initTransData.merchAccount = Number(data?.Header?.Identity?.ReceiverParty?.Identifier || '0');
                    initTransData.merchBalance = 0;
                    initTransData.merchantBank = data?.CustomObject?.merchantBank || '';
                    initTransData.merchCategoryCode = '';
                    initTransData.merchCategoryType = '';
                    initTransData.merchID = Number(data?.CustomObject?.merchantTillID || '0');
                    initTransData.merchantName = data?.CustomObject?.merchantName || '';
                    initTransData.paidVia = data?.CustomObject?.paidVia || '';
                    initTransData.qrCode = data?.CustomObject?.qrCode || '';
                    initTransData.qrType = data?.CustomObject?.qrType || '';
                    initTransData.rating = '';
                    initTransData.reverseTID = 0;
                    initTransData.reviews = '';
                    initTransData.thirdPartTID = 0;
                    initTransData.TID = Number(data?.Result?.TransactionID || '0');
                    initTransData.tilPayment = 0;
                    initTransData.tipAmount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TIP Amount';})?.Value || '0');
                    initTransData.transAmount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
                    initTransData.transactionStatus = 'Pending'; 

                    console.log(JSON.stringify(initTransData));
                }
            }catch(err){
                logger.error({event: 'error -> insertTransactionHistory - QR_PAYMENT', error: {message:error.message, stack: error.stack}});
                //console.log(err);
            }

            if(initTransData != null) {
                try {
                    let conn = await open(cn);
                    const stmt = conn.prepareSync(`INSERT INTO ${schema}.QR_PAYMENT (CHANNEL, MERCH_NAME, REVERS_TID, REVIEWS, THIRDPARTY_TID, TID, TILL_PAYMENT, TIP_AMOUNT, CONSUEMER_BALANCE, CUST_MSISDN, "DATE", FEE_AMOUNT, MERCH_ACCOUNT, MERCH_BALANCE, MERCH_BANK, MERCH_CATEGORY_CODE, MERCH_CATEGORY_TYPE, MERCH_ID, PAID_VIA, QR_CODE, QR_TYPE, RATING, TRANS_AMOUNT, TRANS_STATUS) VALUES('${initTransData.channel}', '${initTransData.merchantName}', ${initTransData.reverseTID}, '${initTransData.reviews}', ${initTransData.thirdPartTID}, ${initTransData.TID}, ${initTransData.tilPayment}, ${initTransData.tipAmount}, ${initTransData.consumerBalance}, ${initTransData.custMsisdn}, TIMESTAMP_FORMAT('${initTransData.transactionTime}','YYYY-MM-DD HH24:MI:SS'), ${initTransData.fee}, ${initTransData.merchAccount}, ${initTransData.merchBalance}, '${initTransData.merchantBank}',
                    '${initTransData.merchCategoryCode}','${initTransData.merchCategoryType}', ${initTransData.merchID}, 
                    '${initTransData.paidVia}', '${initTransData.qrCode}', '${initTransData.qrType}', '${initTransData.rating}', ${initTransData.transAmount},
                    '${initTransData.transactionStatus}');`);
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

        if(tableName === config.reportingDBTables.MOBILE_BUNDLE)
        {
            let initTransData = {};
            try { 
                logger.info({ event: 'Entered function', functionName: 'insertTransactionHistory in class DB2Connection - MOBILE_BUNDLE'});
                console.log(data);

                if (data.Result.ResultCode == 0) {
                    initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {return param.Key == 'bundleName';})?.Value || '';
                    initTransData.bundleType = '';
                    initTransData.channel = data.Header.SubChannel;
                    initTransData.initiatorMsisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => {return param.Key == 'operator';})?.Value || '';
                    initTransData.targetMsisdn = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'TargetMSISDN';})?.Value || '0');
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
                    if (initTransData.transactionDate !== ''){
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
                    }
                    initTransData.TID = Number(data?.Result?.TransactionID || '0');

                    console.log(JSON.stringify(initTransData));
                }
            }catch(err){
                logger.error({event: 'error -> insertTransactionHistory - MOBILE_BUNDLE', error: {message:error.message, stack: error.stack}});
                //console.log(err);
            }

            if(initTransData != null) {
                try {
                    let conn = await open(cn);
                    const stmt = conn.prepareSync(`INSERT INTO ${schema}.MOBILE_BUNDLE (AMOUNT, BUNDLE_NAME, BUNDLE_TYPE, CHANNEL, INITIATOR_MSISDN, NETWORK, TARGET_MSISDN, TRANS_DATE, TRANS_ID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`);
                    stmt.executeSync([initTransData.amount, initTransData.bundleName, initTransData.bundleType, initTransData.channel, initTransData.initiatorMsisdn, initTransData.network, initTransData.targetMsisdn, initTransData.transactionDate, initTransData.TID                    ]);
                    stmt.closeSync();
                    conn.close(function(err) {});
                    console.log("insert done");
                } catch (err) {
                    logger.error('Database connection error' + err);
                    return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
                }
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
            const stmt = conn.prepareSync(`INSERT INTO ${schema}.INCOMMING_IBFT (TRXID_EASYPAISA, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, RECEIVER_MSISDN, RECEIVER_CNIC, RECEIVER_NAME, ID_LEVEL, REGION, CITY, ADDRESS, AMOUNT, TRX_STATUS, REVERSE_STATUS, SENDER_NAME, SENDER_BANK, SENDER_ACCOUNT, REVERSED_TRX_ID, REVERSED_REASON, FAILURE_REASON, FEE, FED, STAN, CURRENT_BALANCE, CHANNEL, FINID_EASYPAISA, TRANS_OBJECTIVE) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`);
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
            const stmt = conn.prepareSync(`INSERT INTO ${schema}.OUTGOING_IBFT (TRX_OBJECTIVE, TRXID_EASYPAISA, FINID_JAZZCASH, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, BENEFICIARY_NAME, BENEFICIARY_BANK, SENDER_MSISDN, BENEFICIARY_ACCOUNT, SENDER_LEVEL, SENDER_CNIC, RECEIVER_MSISDN, INITIATOR_MSISDN, INITIATOR_CITY, INITIATOR_REGION, SENDER_NAME, AMOUNT, TRX_STATUS, FAILURE_REASON, REVERSAL_STATUS, FEE, FED, COMMISSION, WHT, STAN, CURRENT_BALANCE, CHANNEL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`);
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
            const stmt = conn.prepareSync(`UPDATE ${schema}.INCOMMING_IBFT SET TRXID_JAZZCASH = ?, FINID_EASYPAISA = ?, TRANS_OBJECTIVE = ?, TRX_DATE = ?, TRX_TIME = ?, TRX_STATUS = ?, FEE = ?, FED = ?, CURRENT_BALANCE = ?, FAILURE_REASON = ? WHERE TRXID_EASYPAISA = ?;`);
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
                stmt = conn.prepareSync(`UPDATE ${schema}.OUTGOING_IBFT SET TRXID_EASYPAISA = ?, TRXID_JAZZCASH = ?, TRX_DATE = ?, TRX_TIME = ?, AMOUNT = ?, TRX_STATUS = ?, FEE = ?, FED = ?, COMMISSION = ?, WHT = ?, CURRENT_BALANCE = ?, STAN = ?, BENEFICIARY_NAME = ?, FAILURE_REASON = ?, REVERSAL_STATUS = ? WHERE FINID_JAZZCASH = ?;`);
                stmt.executeSync([dataPayload.transactionIDEasyPaisa, dataPayload.transactionIDJazzcash, dataPayload.transactionDate, dataPayload.transactionTime, dataPayload.amount, dataPayload.transactionStatus, dataPayload.fee, dataPayload.fed, dataPayload.commission, dataPayload.wht, dataPayload.currentBalance, dataPayload.stan, dataPayload.beneficiaryBankAccountTitle, dataPayload.reasonOfFailure, dataPayload.reversalStatus, dataPayload.financialIDJazzcash]);    
            } else {
                stmt = conn.prepareSync(`UPDATE ${schema}.OUTGOING_IBFT SET TRXID_EASYPAISA = ?, TRXID_JAZZCASH = ?, TRX_DATE = ?, TRX_TIME = ?, AMOUNT = ?, TRX_STATUS = ?, FEE = ?, FED = ?, COMMISSION = ?, WHT = ?, CURRENT_BALANCE = ?, STAN = ?, FAILURE_REASON = ?, REVERSAL_STATUS = ? WHERE FINID_JAZZCASH = ?;`);
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
            const stmt = conn.prepareSync(`select * from ${schema}.INCOMMING_IBFT WHERE TRX_DATE BETWEEN ? AND ?;`);
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