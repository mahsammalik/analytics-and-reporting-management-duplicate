import { logger, Broker } from '/util/';
import DB2Connection from '../util/DB2Connection';
import moment from 'moment';
const SCHEMA = "COMMON"

class Processor {

    constructor() { }

    async mobileBundleConsumerProcessor(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'mobileBundleConsumerProcessor in class Processor' });
            //logger.debug(data);
            let initTransData = {};

        if (data.Result.ResultCode == 0) {
            let discounted = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'discounted'));
            if(discounted !=undefined && discounted == true  ){
                let init_MP=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'init_merchant_to_payment'&& e.Value== true));
                let confirm_MP=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'confirm_merchant_to_payment'&& e.Value ==true));    
                let typeB2B=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'init_without_confirm_b2b'&& e.Value ==true));    
                let typeRefundB2B=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'refund_without_confirm_b2b'&& e.Value ==true));    

                if( init_MP == true ){
                console.log('***********init merchant to payment disocunted**************')           
                initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                initTransData.bundleType = data?.CustomObject?.bundleType || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.responseCode = data?.Result?.ResultCode || '';
                initTransData.responseDesc = data?.Result?.ResultDesc || '';
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);
                //new codee
                initTransData.discounted = discounted!=undefined? discounted: false;
                initTransData.typeOfTransaction = 'init_merchant_to_payment';
                logger.debug(JSON.stringify(initTransData));
                }
                else if(confirm_MP == true ){
                console.log('***********confirm merchant to payment disocunted**************')           
                initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                initTransData.bundleType = data?.CustomObject?.bundleType || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.responseCode = data?.Result?.ResultCode || '';
                initTransData.responseDesc = data?.Result?.ResultDesc || '';
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);
                //new codee
                initTransData.discounted = discounted!=undefined? discounted: false;
                initTransData.typeOfTransaction = 'confirm_merchant_to_payment';
                logger.debug(JSON.stringify(initTransData));
                }
                else if(typeB2B== true ){
                console.log('***********b2b case discounted**************')
                initTransData.amount = Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'transactionAmount'; })?.Value || '0');
                initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                initTransData.bundleType = data?.CustomObject?.bundleType || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.responseCode = data?.Result?.ResultCode || '';
                initTransData.responseDesc = data?.Result?.ResultDesc || '';
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'transactionIdUser'; })?.Value || '' ;
                initTransData.transactionStatus = 'Completed';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);
                //new codeee 
                initTransData.discounted = discounted!=undefined? discounted: false;
                initTransData.TIDB= data?.Result?.TransactionID || '0';
                initTransData.subscription = 'self';
                initTransData.bundleAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleAmount'; })?.Value || '0');
                initTransData.incentiveAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == ' incentiveAmount'; })?.Value || '0');
                initTransData.incentiveAmountByPartner = Number('0');
                initTransData.MsisdnB ='';
                initTransData.typeOfTransaction = 'init_without_confirm_b2b';
                initTransData.transactionStatusB = 'Completed';
                logger.debug(JSON.stringify(initTransData));
                }
                else if( typeRefundB2B== true ){
                console.log('***********refund b2b case**************')
                initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'transactionAmount'; })?.Value || '0');
                initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                initTransData.bundleType = data?.CustomObject?.bundleType || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.responseCode = data?.Result?.ResultCode || '';
                initTransData.responseDesc = data?.Result?.ResultDesc || '';
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'transactionIdUser'; })?.Value || '' ;
                initTransData.transactionStatus =  'Completed';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);
                //new codee 
                initTransData.discounted = discounted!=undefined? discounted: false;
                initTransData.TIDB = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'transactionIdB2B'; })?.Value || '' ;
                initTransData.TIDBReversal = data?.Result?.TransactionID || '0';
                initTransData.subscription = 'self';
                initTransData.bundleAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleAmount'; })?.Value || '0');
                initTransData.incentiveAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == ' incentiveAmount'; })?.Value || '0');
                initTransData.incentiveAmountByPartner = Number('0');
                initTransData.MsisdnB ='';
                initTransData.typeOfTransaction = 'refund_without_confirm_b2b';
                initTransData.transactionStatusB = 'Refund';
                logger.debug(JSON.stringify(initTransData));
                }
            }else{
                initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                initTransData.bundleType = data?.CustomObject?.bundleType || '';
                initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || ''
                initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                initTransData.responseCode = data?.Result?.ResultCode || '';
                initTransData.responseDesc = data?.Result?.ResultDesc || '';
                if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                }
                initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                }
                initTransData.TID = data?.Result?.TransactionID || '0';
                initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                initTransData.topic = data.topic;
                initTransData.msg_offset = Number(data.msg_offset);

                logger.debug(JSON.stringify(initTransData));
                }
        }
            

            if (JSON.stringify(initTransData) !== '{}') {
                await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.MOBILE_BUNDLE, initTransData);
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'mobileBundleConsumerProcessor in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }

    async mobileBundleConsumerProcessorZong(data, isConfirm = false) {
        try {
            logger.info({ event: 'Entered function', functionName: 'mobileBundleConsumerProcessorZong in class Processor' });
            //logger.debug(data);
            let initTransData = {};

            if (data.Result.ResultCode == 0) {
                let discounted = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'discounted'));
                if(discounted !=undefined && discounted == true  ){
                    let  init_MP=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'init_merchant_to_payment'&& e.Value== true));
                    let  confirm_MP=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'confirm_merchant_to_payment'&& e.Value ==true));    
                    let  typeB2B=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'init_without_confirm_b2b'&& e.Value ==true));    
                    let  typeRefundB2B=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'refund_without_confirm_b2b'&& e.Value ==true)); 
                    let  init_MP_refund=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'init_merchant_to_payment_refund'&& e.Value== true));
                    let  confirm_MP_refund=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'confirm_merchant_to_payment_refund'&& e.Value ==true));
                    if( init_MP == true ){ 
                    console.log('***********init merchant to payment disocunted**************');  
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'offerIDDAID'; })?.Value || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);
                     //new codee
                    initTransData.discounted = discounted!=undefined? discounted: false;
                    initTransData.typeOfTransaction = 'init_merchant_to_payment';
                    logger.debug(JSON.stringify(initTransData));
                    }
                    else if( confirm_MP == true){ 
                    console.log('***********confirm merchant to payment disocunted**************');  
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'offerIDDAID'; })?.Value || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);
                    //new codee
                    initTransData.discounted = discounted!=undefined? discounted: false;
                    initTransData.typeOfTransaction = 'confirm_merchant_to_payment';

                    logger.debug(JSON.stringify(initTransData));
                    }
                    else if(typeB2B == true ){ 
                    console.log('***********b2b discounted case**************');  
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'offerIDDAID'; })?.Value || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                    initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                    const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                    initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);
                    //new codeee 
                    initTransData.discounted = discounted!=undefined? discounted: false;
                    initTransData.TIDB= data?.Result?.TransactionID || '0';
                    initTransData.subscription = 'self';
                    initTransData.bundleAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleAmount'; })?.Value || '0');
                    initTransData.incentiveAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == ' incentiveAmount'; })?.Value || '0');
                    initTransData.incentiveAmountByPartner = Number('0');
                    initTransData.MsisdnB ='';
                    initTransData.typeOfTransaction = 'init_without_confirm_b2b';
                    initTransData.transactionStatusB = 'Completed';

                    logger.debug(JSON.stringify(initTransData));
                    }
                    else if(typeRefundB2B== true ){ 
                    console.log('***********b2b refund case discounted**************');  
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'offerIDDAID'; })?.Value || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);
                    //new codee 
                    initTransData.discounted = discounted!=undefined? discounted: false;
                    initTransData.TIDB = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'transactionIdB2B'; })?.Value || '' ;
                    initTransData.TIDBReversal = data?.Result?.TransactionID || '0';
                    initTransData.subscription = 'self';
                    initTransData.bundleAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleAmount'; })?.Value || '0');
                    initTransData.incentiveAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == ' incentiveAmount'; })?.Value || '0');
                    initTransData.incentiveAmountByPartner = Number('0');
                    initTransData.MsisdnB ='';
                    initTransData.typeOfTransaction = 'refund_without_confirm_b2b';
                    initTransData.transactionStatusB = 'Refund';
                    logger.debug(JSON.stringify(initTransData));
                    }
                    else if(init_MP_refund == true){
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'offerIDDAID'; })?.Value || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);
                    //new codee 
                    initTransData.discounted = discounted!=undefined? discounted: false;
                    initTransData.typeOfTransaction = 'init_merchant_to_payment_refund';
                    initTransData.TIDReversal= data?.Result?.TransactionID || '0';
                    initTransData.TIDBReversal = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'transactionIdB2BRefund'; })?.Value || '' ;
                    initTransData.subscription = 'self';
                    initTransData.bundleAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundlePriceTotalRefund'; })?.Value || '0');
                    initTransData.incentiveAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == ' incentiveAmount'; })?.Value || '0');
                    initTransData.incentiveAmountByPartner = Number('0');
                    initTransData.MsisdnB ='';
    
                    logger.debug(JSON.stringify(initTransData));    
                    }
                    else if(confirm_MP_refund == true){
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'offerIDDAID'; })?.Value || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);
                    //new codee 
                    initTransData.discounted = discounted!=undefined? discounted: false;
                     initTransData.typeOfTransaction = 'confirm_merchant_to_payment_refund';
                    logger.debug(JSON.stringify(initTransData));
                    }
                }else{
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'offerIDDAID'; })?.Value || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'Completed' : 'Pending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);

                    logger.debug(JSON.stringify(initTransData));
                    }
            }

            if (JSON.stringify(initTransData) !== '{}') {
                await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.MOBILE_BUNDLE, initTransData);
            }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'mobileBundleConsumerProcessorZong in class Processor', error: { message: error.message, stack: error.stack } });
            //throw new Error(error);
        }
    }
    async mobileBundleConsumerProcessorRefund(data, isConfirm = false){
        try {
                logger.info({ event: 'Entered function', functionName: 'mobileBundleConsumerProcessorRefund in class Processor' });
                //logger.debug(data);
                let initTransData = {};
                if (data.Result.ResultCode == 0) {
                let discounted = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'discounted'));
                if(discounted !=undefined && discounted == true){
                    let init_MP_refund=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'init_merchant_to_payment_refund'&& e.Value== true));
                    let confirm_MP_refund=  data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.some(e =>(e.Key== 'confirm_merchant_to_payment_refund'&& e.Value ==true)); 
                    if(init_MP_refund == true){
                    console.log('*********** init merchant to consumer refund case discounted**************');  
                    initTransData.amount = Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleDiscountedPriceRefund'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.CustomObject?.bundleType || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'transactionIdUser'; })?.Value || '' ;
                    initTransData.transactionStatus = isConfirm ? 'refundCompleted' : 'refundPending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);
                    //new codee discounted 
                    initTransData.discounted = discounted!=undefined? discounted: false;
                    initTransData.typeOfTransaction = 'init_merchant_to_payment_refund';
                    initTransData.TIDReversal= data?.Result?.TransactionID || '0';
                    initTransData.TIDBReversal = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'transactionIdB2BRefund'; })?.Value || '' ;
                    initTransData.subscription = 'self';
                    initTransData.bundleAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundlePriceTotalRefund'; })?.Value || '0');
                    initTransData.incentiveAmount= Number(data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == ' incentiveAmount'; })?.Value || '0');
                    initTransData.incentiveAmountByPartner = Number('0');
                    initTransData.MsisdnB ='';
                    logger.debug(JSON.stringify(initTransData));
                    }
                    else if(confirm_MP_refund == true){
                    console.log('*********** confirm merchant to consumer refund case discounted**************'); 
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.CustomObject?.bundleType || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'refundCompleted' : 'refundPending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);
                    //new codee 
                    initTransData.discounted = discounted!=undefined? discounted: false;
                    initTransData.typeOfTransaction = 'confirm_merchant_to_payment_refund';
                    logger.debug(JSON.stringify(initTransData)); 
                    }
                }else{              
                    initTransData.amount = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'Amount'; })?.Value || '0');
                    initTransData.bundleName = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'bundleName'; })?.Value || '';
                    initTransData.bundleType = data?.CustomObject?.bundleType || '';
                    initTransData.channel = data.Header?.ThirdPartyType || data.Header.SubChannel;
                    initTransData.initiatorMsisdn = data?.Header?.Identity?.Initiator?.Identifier || '0';
                    initTransData.network = data?.Request?.Transaction?.ReferenceData?.ReferenceItem?.find((param) => { return param.Key == 'operator'; })?.Value || '';
                    initTransData.targetMsisdn = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TargetMSISDN'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.voiceMinutes = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'voiceMinutes'; })?.Value || '0';
                    initTransData.smsDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'smsDetails'; })?.Value || '0';
                    initTransData.DataDetails = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'DataDetails'; })?.Value || '0';
                    initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndDate'; })?.Value || '';
                    initTransData.responseCode = data?.Result?.ResultCode || '';
                    initTransData.responseDesc = data?.Result?.ResultDesc || '';
                    if (initTransData.transactionDate !== '') {
                        initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');
                    }
                    initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => { return param.Key == 'TransEndTime'; })?.Value || '';
                    if (initTransData.transactionTime !== '') {
                        const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');
                        initTransData.transactionTime = initTransData.transactionDate + " " + time;
                    }
                    initTransData.TID = data?.Result?.TransactionID || '0';
                    initTransData.transactionStatus = isConfirm ? 'refundCompleted' : 'refundPending';
                    initTransData.topic = data.topic;
                    initTransData.msg_offset = Number(data.msg_offset);

                    logger.debug(JSON.stringify(initTransData));
            }
                }
                if (JSON.stringify(initTransData) !== '{}') {
                    await DB2Connection.insertTransactionHistory(SCHEMA, config.reportingDBTables.MOBILE_BUNDLE, initTransData);
                }
        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'mobileBundleConsumerProcessorRefund in class Processor', error: { message: error.message, stack: error.stack } });
        //throw new Error(error);
        }
    }
}

export default new Processor();