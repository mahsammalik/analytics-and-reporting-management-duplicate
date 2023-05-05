import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = config.DB2_Jazz.schema;

class Processor {

    constructor() { }

    async processFoodOrderingConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processFoodOrderingConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            initTransData.id = data?.CustomObject?.orderId || '';
            initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
            if (initTransData.transactionDate !== '') {
                initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
            }
            initTransData.orderDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
            if (initTransData.orderDate !== '') {
                const time = moment(initTransData.orderDate, 'HHmmss').format('HH:mm:ss');
                initTransData.orderDate = initTransData.transactionDate + " " + time;
            }
            initTransData.amount = Number(data?.CustomObject?.transactionObject?.transactionData?.paymentDetails?.amount || '0');
            initTransData.resturantName = data?.CustomObject?.transactionObject?.transactionData?.paymentDetails?.companyShortName || '';
            initTransData.transStatus = isConfirm ? 'Completed' : 'Pending';
            initTransData.channel = data?.CustomObject?.channel || 'Mobile';
            initTransData.topic = data.topic;
            initTransData.msg_offset = Number(data.msg_offset);

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if (process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.FOOD_DELIVERY, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.FOOD_DELIVERY, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processFoodOrderingConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();