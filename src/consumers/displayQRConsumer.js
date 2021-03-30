import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = process.env.NODE_ENV === 'live' ? "COMMON" : config.IBMDB2_Dev.schema;

class Processor {

    constructor() { }

    async processDisplayQRConsumer(data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'processDisplayQRConsumer in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            initTransData.TillNumber = Number(data.TillNumber);
            initTransData.MerchantMSISDN = Number(data.MerchantMSISDN);
            initTransData.MerchantCategoryCode = data.MerchantCategoryCode;
            initTransData.TransactionCurrency = data.TransactionCurrency;
            initTransData.CountryCode = initTransData.CountryCode;
            initTransData.ShopName = data.ShopName;
            initTransData.CityID = data.CityID;
            initTransData.cnic = data.CNIC;
            initTransData.Email = data.Email;
            initTransData.MerchantType = data.MerchantType;
            initTransData.BrandName = data.BrandName;
            initTransData.BrandAddress = data.BrandAddress;
            initTransData.BrandArea = data.BrandArea;
            initTransData.BrandEmail = data.BrandEmail;
            initTransData.BrandCityID = data.BrandCityID;
            initTransData.CourierTrackingID = data.CourierTrackingID;
            initTransData.MoblieNumber1 = data.MoblieNumber1;
            initTransData.MoblieNumber2 = data.MoblieNumber2;
            initTransData.MoblieNumber3 = data.MoblieNumber3;
            initTransData.MoblieNumber4 = data.MoblieNumber4;
            initTransData.MoblieNumber5 = data.MoblieNumber5;
            initTransData.ReferralNumber = data.ReferralNumber;
            initTransData.isOutletActive = data.isOutletActive;
            initTransData.OutletStatus = data.OutletStatus;
            initTransData.QRPayload = data.QRPayload;
            initTransData.QRImage = data.QRImage;
            initTransData.QRId = data.QRId;
            initTransData.Amount = Number(data.Amount);
            initTransData.channel = data?.channel || 'Mobile';
            initTransData.qrType = data?.qrType || null;

            logger.debug(JSON.stringify(initTransData));

            if (JSON.stringify(initTransData) !== '{}') {
                if(process.env.NODE_ENV === 'development') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.DISPLAY_QR, initTransData);
                }
                else {
                    await DB2Connection.insertTransactionHistory("MERCHANT", config.reportingDBTables.DISPLAY_QR, initTransData);
                }
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'processDisplayQRConsumer in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
}

export default new Processor();