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
                initTransData.bookingID = Number(data?.CustomObject?.bookingId || '0');
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.cnic = data?.CustomObject?.cnic || '';
                initTransData.destination = data?.CustomObject?.destinationCityName || '';
                initTransData.discount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Discount'; })?.Value || '0');
                initTransData.email = data?.CustomObject?.email || '';
                initTransData.fee = Number(data?.CustomObject?.fee || '0');
                initTransData.gender = '';
                initTransData.msisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.origin = data?.CustomObject?.departureCityName || '';
                initTransData.price = Number(data?.CustomObject?.ticketPrice || '0');
                initTransData.originPrice = initTransData.price;
                initTransData.promo = '';
                initTransData.seats = data?.CustomObject?.noOfSeats || '';
                initTransData.seatNumber = (data?.CustomObject?.seatNumbersMale || '') + "  " + (data?.CustomObject?.seatNumbersFemale || '');
                initTransData.service = data?.CustomObject?.serviceName || '';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.failureReason = '';
                initTransData.TID = Number(data?.Result?.TransactionID || '0');
                initTransData.travelDate = null;
                initTransData.depDate = data?.CustomObject?.departureDate || null;
                if(initTransData.depDate != null)
                {
                	initTransData.depDate = moment(initTransData.depDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
                }
                initTransData.depTime = data?.CustomObject?.departureTime || null;
                if(initTransData.depTime != null)
                {
                	initTransData.depTime = moment(initTransData.depTime, 'HH:mm A').format('HH:mm:ss');
                }
                if(initTransData.depDate != null && initTransData.depTime != null)
                {
                	initTransData.travelDate = initTransData.depDate+" "+initTransData.depTime;
                }
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

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