import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';

class Processor {
    async processGtoPCnicTransferConsumer(data) {
        try{
            logger.info({ event: 'Entered function', functionName: 'processGtoPCnicTransferConsumer in class Processor' });
            let initTransData = {};
            if(data.Result.ResultCode == 0){
                initTransData.TransactionID = data?.Result?.TransactionID || "0";
                let timestamp = data?.Request?.Transaction?.Timestamp;
                initTransData.timestamp = timestamp.substring(0,4) + ":" + timestamp.substring(4,6) + ":" + timestamp.substring(6,8) + " " + timestamp.substring(8,10) + ":" + timestamp.substring(10,12) + ":" + timestamp.substring(12,)
                initTransData.customerCnic = data?.Header?.Identity?.ReceiverParty?.CNIC;
                initTransData.serviceName = "G2P Payment To CNIC via API";
                initTransData.amount = Number(data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.fee = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Fee'; })?.Value || '';
                initTransData.channel = data?.Header?.Channel || "App";
                initTransData.transactionStatus = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'FailedReason'; }) ? "Failed": "Success";
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;

                if(JSON.stringify(initTransData) !== '{}'){
                    await DB2Connection.addRecipientInSpsu("COMMON", config.reportingDBTables.SPSU, initTransData);
                }
            }
        }
        catch(error){
            logger.error({ event: 'Error thrown ', functionName: 'processGtoPCnicTransferConsumer in class Processor', error: { message: error.message, stack: error.stack } });
        }
    }
}
export default new Processor();