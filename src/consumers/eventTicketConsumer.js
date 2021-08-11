import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() {}

    async processEventTicketConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processEventTicketConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.bookingID = data?.CustomObject?.bookingId || '';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.city = data?.CustomObject?.city || '';
                initTransData.cnic = data?.CustomObject?.cnic || '';
                initTransData.discount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Discount'; })?.Value || '0');
                initTransData.email = data?.CustomObject?.customerEmail || '';
                initTransData.event = data?.CustomObject?.eventTitle || '';
                initTransData.eDate = data?.CustomObject?.date || null;
                initTransData.eTime = data?.CustomObject?.eventTime || null;
	            if(initTransData.eDate != null)
                {
                	initTransData.eDate = moment(initTransData.eDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
                }
                if(initTransData.eTime != null)
                {
                	initTransData.eTime = moment(initTransData.eTime, 'HH:mm A').format('HH:mm:ss');
                }
                initTransData.eventDate = null;
                if(initTransData.eDate != null && initTransData.eTime != null)
                {
                	initTransData.eventDate = initTransData.eDate+" "+initTransData.eTime;
                }
                initTransData.failReason = '';
                initTransData.msisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.numSeats = Number(data?.CustomObject?.qty || '0');
                initTransData.partner = data?.CustomObject?.partner || '';
                initTransData.price = Number(data?.CustomObject?.price || '0');
                initTransData.promoAmount = 0;
                initTransData.promoApplied = data?.CustomObject?.promoApplied || '';
                if(initTransData.promoApplied != '')
                {
                    initTransData.promoApplied = initTransData.promoApplied == true ? 'Yes' : 'No'
                }
                initTransData.revenue = 0;
                initTransData.seatClass = '';
                initTransData.status = isConfirm ? "Completed" : "Pending";
                initTransData.TID = Number(data?.Result?.TransactionID || '0');
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.EVENT_TICKET, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("COMMON", config.reportingDBTables.EVENT_TICKET, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processEventTicketConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();