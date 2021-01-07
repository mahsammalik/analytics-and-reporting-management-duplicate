import { open } from 'ibm_db';
import responseCodeHandler from './responseCodeHandler';
import { logger } from '/util/';
import moment from 'moment';

const cn = process.env.DB2Connection || config.IBMDB2.connectionString;
const schema = config.IBMDB2.schema;

class DatabaseConn {

    async insertTransactionHistory(schemaName, tableName, data) {
        if(tableName === config.reportingDBTables.INCOMMING_IBFT)
        {
            let initTransData = {};
            try { 
                logger.info({ event: 'Entered function', functionName: 'insertTransactionHistory in class DB2Connection - INCOMING_IBFT'});
                console.log(data);

                if (data.Result.ResultCode == 0) {
                    initTransData.transactionIDEasyPaisa = data.CustomObject.senderTransactionID? data.CustomObject.senderTransactionID : '';
                    initTransData.financialIDEasyPaisa = '';
                    initTransData.transactionIDEasyJazzcash = data.Result.TransactionID;         
                    initTransData.paymentPurpose = '';

                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
                    if (initTransData.transactionDate !== ''){
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
                    }

                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
                    if (initTransData.transactionTime !== ''){
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    //initTransData.transactionTime = moment(initTransData.transactionTime).format('YYYY-MM-DD HH:mm:ss');
                    }

                    initTransData.receiverMsisdn = Number(data.CustomObject.creditParty?.msisdn || '0');
                    initTransData.receiverCnic = data.CustomObject.receiverCnic? data.CustomObject.receiverCnic : '';
                    initTransData.receiverName = data.CustomObject.receiverAccountTitle ? data.CustomObject.receiverAccountTitle : '';
                    initTransData.identityLevel =  data.CustomObject.identityType ? data.CustomObject.identityType : '';
                    initTransData.region = ''; 
                    initTransData.city = ''; 
                    initTransData.address = ''; 
                    initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
                    initTransData.transactionStatus = 'Pending'; 
                    initTransData.reversalStatus = ''; 
                    initTransData.senderName = data.CustomObject.debitParty?.accountTitle || ''; 
                    initTransData.senderBankName = ''; 
                    initTransData.senderAccount = data.CustomObject.debitParty?.iban || '';

                    initTransData.reversedTrasactionID = ''; 
                    initTransData.reversedReason = ''; 
                    initTransData.reasonOfFailure = '';

                    initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
                    initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
                    initTransData.stan = data.CustomObject.senderTransactionID ? data.CustomObject.senderTransactionID : '';
                    initTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
                    initTransData.channel = data.Header.Channel;
                    console.log(JSON.stringify(initTransData));
                    }
                    else {
                    console.log('Failure scenario for insertTransactionHistroy - INCOMING_IBFT');
                    
                    initTransData.transactionIDEasyPaisa = data.CustomObject.senderTransactionID;
                    initTransData.financialIDEasyPaisa = '';
                    initTransData.transactionIDEasyJazzcash = data.Result.TransactionID;         
                    initTransData.paymentPurpose = '';

                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
                    if (initTransData.transactionDate !== ''){
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
                    }

                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
                    if (initTransData.transactionTime !== ''){
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;     
                    //initTransData.transactionTime = new Date(initTransData.transactionTime).toString(); 
                    }

                    initTransData.receiverMsisdn = data.CustomObject.creditParty?.msisdn || '';
                    initTransData.receiverCnic = data.CustomObject.receiverCnic;
                    initTransData.receiverName = data.CustomObject.receiverAccountTitle;
                    initTransData.identityLevel =  data.CustomObject.identityType;
                    initTransData.region = ''; 
                    initTransData.city = ''; 
                    initTransData.address = ''; 
                    initTransData.amount = Number(data.CustomObject.amount);
                    initTransData.transactionStatus = 'Failed'; 
                    initTransData.reversalStatus = ''; 
                    initTransData.senderName = data.CustomObject.debitParty?.accountTitle || ''; 
                    initTransData.senderBankName = ''; 
                    initTransData.senderAccount = data.CustomObject.debitParty?.iban || '';
                    
                    initTransData.reversedTrasactionID = ''; 
                    initTransData.reversedReason = '';
                    
                    let reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'FailedReason';})?.Value || '';
                    if (typeof(reasonOfFailure) === 'object' && obj !== null) {
                        reasonOfFailure = '';
                    }

                    initTransData.reasonOfFailure = reasonOfFailure;
                    
                    initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
                    initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
                    initTransData.stan = data.CustomObject.senderTransactionID;
                    initTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
                    initTransData.channel = data.Header.Channel;
                    console.log(JSON.stringify(initTransData));
                }
            }catch(err){
                console.log('error -> insertTransactionHistory - INCOMING_IBFT');
                console.log(err);
            }

            if(initTransData != null) {
                try {
                    let conn = await open(cn);
                    const stmt = conn.prepareSync(`INSERT INTO ${schemaName}.INCOMMING_IBFT (TRXID_EASYPAISA, TRXID_JAZZCASH, TRX_DATE, TRX_TIME, RECEIVER_MSISDN, RECEIVER_CNIC, RECEIVER_NAME, ID_LEVEL, REGION, CITY, ADDRESS, AMOUNT, TRX_STATUS, REVERSE_STATUS, SENDER_NAME, SENDER_BANK, SENDER_ACCOUNT, REVERSED_TRX_ID, REVERSED_REASON, FAILURE_REASON, FEE, FED, STAN, CURRENT_BALANCE, CHANNEL, FINID_EASYPAISA, TRANS_OBJECTIVE) VALUES('${initTransData.transactionIDEasyPaisa}' , ${initTransData.transactionIDEasyJazzcash} , '${initTransData.transactionDate}' , '${initTransData.transactionTime}' , ${initTransData.receiverMsisdn} , '${initTransData.receiverCnic}' , '${initTransData.receiverName}' , '${initTransData.identityLevel}' , '${initTransData.region}' , '${initTransData.city}' , '${initTransData.address}' , ${initTransData.amount} , '${initTransData.transactionStatus}' , '${initTransData.reversalStatus}' , '${initTransData.senderName}' , '${initTransData.senderBankName}' , '${initTransData.senderAccount}' , '${initTransData.reversedTrasactionID}' , '${initTransData.reversedReason}' , '${initTransData.reasonOfFailure}' , ${initTransData.fee} , ${initTransData.fed} , '${initTransData.stan}' , ${initTransData.currentBalance} , '${initTransData.channel}' , '${initTransData.financialIDEasyPaisa}' , '${initTransData.paymentPurpose}');`);
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