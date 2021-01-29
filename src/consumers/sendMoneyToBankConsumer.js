import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processSendMoneyToBankConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processSendMoneyToBankConsumer in class Processor' });
            //console.log(data);

            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.trxObjective = data.CustomObject?.purposeofRemittanceCode ? data.CustomObject.purposeofRemittanceCode.split(',')[0]?.split('=')?.[1] || '' : '';
                if(initTransData.trxObjective === '') {
                    initTransData.trxObjective = data.CustomObject?.purposeofRemittanceCode;
                }
                initTransData.transactionObjective = data.CustomObject?.purposeofRemittanceCode ? data.CustomObject.purposeofRemittanceCode.split(',')[2]?.split('=')?.[1] || '' : '';
                if(initTransData.transactionObjective === '') {
                    initTransData.transactionObjective = data.CustomObject?.purposeofRemittanceCode;
                }
                initTransData.financialIDJazzcash = data.Result.TransactionID;
                initTransData.transactionIDJazzcash = '';

                initTransData.transactionIDEasyPaisa = '';

                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }

                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }

                initTransData.beneficiaryMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'ReceiverMSISDN'; })?.Value || '';
                initTransData.beneficiaryBankName = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'BankName'; })?.Value || '';

                initTransData.senderMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'SenderMSISDN'; })?.Value || '';
                initTransData.beneficiaryBankAccountTitle = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'BankAccountTitle'; })?.Value || '';
                initTransData.beneficiaryBankAccount = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'BankAccountNumber'; })?.Value || '';
                initTransData.beneficiaryBankAccountNumber = initTransData.beneficiaryBankAccount;

                initTransData.senderLevel = data.CustomObject?.IdentityType || '';
                initTransData.senderCnic = data.CustomObject.senderCNIC;
                initTransData.senderName = data.CustomObject?.SenderAccountTitle || '';

                initTransData.receiverMsisdn = initTransData.beneficiaryMsisdn;
                initTransData.initiatorMsisdn = initTransData.senderMsisdn;
                initTransData.initiatorCity = '';
                initTransData.initiatorRegion = '';

                initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.transactionStatus = 'Pending';

                initTransData.reasonOfFailure = '';

                initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Fee'; })?.Value || '0');
                initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Fed'; })?.Value || '0');
                initTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Commission'; })?.Value || '0');
                initTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'WHT'; })?.Value || '0');

                initTransData.reversalStatus = '';

                initTransData.stan = "";
                initTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Balance'; })?.Value || '0');
                initTransData.channel = data.Header.SubChannel;

                console.log(JSON.stringify(initTransData));
            }

            if(JSON.stringify(initTransData) !== '{}')
            {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.COMMON_OUTGOING_IBFT, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.OUTGOING_IBFT, initTransData);
                }
            }
            //console.log(response);
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processSendMoneyToBankConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }

}

export default new Processor();