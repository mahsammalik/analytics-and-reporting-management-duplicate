import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2.schema;

class Processor {

    constructor() { }

    async processQRPaymentConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processQRPaymentConsumer in class Processor' });
            console.log(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.consumerBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Balance'; })?.Value || '0');
                initTransData.channel = data.Header.SubChannel;
                initTransData.custMsisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Fee'; })?.Value || '0');
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
                initTransData.tipAmount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TIP Amount'; })?.Value || '0');
                initTransData.transAmount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.transactionStatus = 'Pending';

                console.log(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.QR_PAYMENT, initTransData);
            }
        } catch(error) {
        logger.error({ event: 'Error thrown ', functionName: 'processQRPaymentConsumer in class Processor', error: { message: error.message, stack: error.stack } });
        //throw new Error(error);
    }
}
}

export default new Processor();