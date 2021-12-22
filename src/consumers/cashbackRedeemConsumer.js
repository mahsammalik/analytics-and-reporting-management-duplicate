import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';


class Processor {

    constructor() { }

    async processCashbackRedeemConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processCashbackRedeemConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};
            if (data.Result.ResultCode == 0) {
                initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.msisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.failureReason = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'FailedReason'; })?.Value || '';
                initTransData.isFailedTrans = data?.isFailedTrans || false;
                initTransData.rewardType = data?.CustomObject?.rewardsType || null;
                initTransData.expiryDate = data?.CustomObject?.expiryDate || null;
                if (initTransData.expiryDate != null) {
                    initTransData.expiryDate = moment(initTransData.expiryDate, 'YYYY-MM-DD').format('YYYY-MM-DD');
                }
                initTransData.rewardsDescription = data?.CustomObject?.rewardsDescription || null;
                initTransData.campaignCode = data?.CustomObject?.campaignCode || null;
                initTransData.campaignName = data?.CustomObject?.campaignName || null;
                initTransData.status = data?.isFailedTrans === true ? 'failed' : 'redeemed';
                initTransData.txID = data?.Result?.TransactionID || '0';
                initTransData.createdOn = data?.CustomObject?.createdOn || null;
                if (initTransData.createdOn != null) {
                    initTransData.createdOn = moment(initTransData.createdOn, 'YYYY-MM-DD').format('YYYY-MM-DD');
                }
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
            }

            if (JSON.stringify(initTransData) !== '{}') {

                await DB2Connection.insertTransactionHistory("CONSUMER", config.reportingDBTables.CASHBACK_REDEEM, initTransData);

            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processCashbackRedeemConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();