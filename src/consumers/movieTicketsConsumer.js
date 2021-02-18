import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processMovieTicketsConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processMovieTicketsConsumer in class Processor' });
            //console.log(data);
            let initTransData = {};

            initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
            if (initTransData.transactionDate !== '') {
                initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
            }
            initTransData.bookDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
            if (initTransData.bookDate !== '') {
                const time = moment(initTransData.bookDate, 'HHmmss').format('HH:mm:ss');
                initTransData.bookDate = initTransData.transactionDate + " " + time;
            }
            const time = data?.CustomObject?.moviePurchaseDetails?.time;
            initTransData.movieDate = data?.CustomObject?.moviePurchaseDetails?.dateTime || null;
            if(initTransData.movieDate != null) {
                initTransData.movieDate = initTransData.movieDate + " " + moment(time, ["h:mm:ssA"]).format("HH:mm:ss");
            }
            initTransData.msisdn = Number(data?.CustomObject?.msisdn || '0');
            initTransData.cnic = data?.CustomObject?.cnic || '';
            initTransData.email = data?.CustomObject?.email || '';
            initTransData.TID = Number(data?.Result?.TransactionID || '0');
            initTransData.cinema = data?.CustomObject?.moviePurchaseDetails?.venue || '';
            initTransData.seatClass = data?.CustomObject?.moviePurchaseDetails?.class || '';
            // limit seatClass length due to column length
            initTransData.seatClass = initTransData.seatClass.substr(0, 10);
            initTransData.city = data?.CustomObject?.moviePurchaseDetails?.city || '';
            initTransData.seats = Number(data?.CustomObject?.moviePurchaseDetails?.quantity || '0');
            initTransData.price = Number(data?.CustomObject?.amount || '0');
            initTransData.revenue = initTransData.price;
            initTransData.transStatus = isConfirm ? 'Completed' : 'Pending';
            initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
            initTransData.channel = data?.CustomObject?.channel || 'Mobile';

            console.log(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if (process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.MOVIE_TICKET, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.MOVIE_TICKET, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processMovieTicketsConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();