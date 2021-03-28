import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processBusTicketConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processBusTicketConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.bookingID = 0;
                initTransData.channel = data.Header.SubChannel;
                initTransData.cnic = '';
                initTransData.destination = '';
                initTransData.discount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Discount'; })?.Value || '0');
                initTransData.email = '';
                initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Fee'; })?.Value || '0');
                initTransData.gender = '';
                initTransData.msisdn = Number(data?.Header?.Identity?.Initiator?.Identifier || '0');
                initTransData.origin = '';
                initTransData.originPrice = 0;
                initTransData.price = 0;
                initTransData.promo = '';
                initTransData.seats = '';
                initTransData.seatNumber = '';
                initTransData.service = '';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.failureReason = '';
                initTransData.TID = Number(data?.Result?.TransactionID || '0');
                initTransData.travelDate = null;

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.BUS_TICKET, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.BUS_TICKET, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processBusTicketConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();