import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processFoodOrderingConsumer(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processFoodOrderingConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.contactNum = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.deliveryAddress = '';
                initTransData.deliveryArea = '';
                initTransData.deliveryCity = '';
                initTransData.deliveryDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DeliveryDate'; })?.Value || null;
                initTransData.discount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Discount'; })?.Value || '0');
                initTransData.email = data.CustomObject?.email || '';
                initTransData.foodCategory = data.CustomObject?.foodCategory || '';
                initTransData.ID = data?.Result?.TransactionID || '';
                initTransData.name = data.CustomObject?.name || '';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.productDetails = data.CustomObject?.productDetails || '';
                initTransData.promoAmount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'PromoAmount'; })?.Value || '0');
                initTransData.promoUsed = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Promo'; })?.Value || '';
                initTransData.resturantName = data.CustomObject?.resturantName || '';
                initTransData.status = isConfirm ? 'Completed' : 'Pending';
                initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
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