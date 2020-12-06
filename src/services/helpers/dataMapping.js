import logger from '../../util/logger';
import moment from 'moment';
var _ = require('lodash');

class dataMapping {
    constructor() {}

    getIBFTIncomingConfirmMapping(data) {
        let confirmTransData={};
        try { 
          logger.info({ event: 'Entered function', functionName: 'getIBFTIncomingConfirmMapping in class dataMapping'});
          console.log(data);
          if (data.Result.ResultCode == 0) {
    
               confirmTransData.transactionIDEasyPaisa = data.CustomObject.senderTransactionID;
               confirmTransData.transactionIDEasyJazzcash = data.Result.TransactionID;
              
               confirmTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
               if (confirmTransData.transactionDate !== ''){
                confirmTransData.transactionDate = moment(confirmTransData.transactionDate).format('YYYY-MM-DD');           
               }
    
               confirmTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
               if (confirmTransData.transactionTime !== ''){
                const time = moment(confirmTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
                confirmTransData.transactionTime = confirmTransData.transactionDate + " " + time;      
               }
               
               confirmTransData.receiverMsisdn = data.CustomObject.creditParty.msisdn;
               confirmTransData.receiverCnic = '';
               confirmTransData.receiverName = data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'BeneficiaryName';})?.Value || '';
               confirmTransData.identityLevel = '';
               confirmTransData.region = ''; 
               confirmTransData.city = ''; 
               confirmTransData.address = ''; 
               confirmTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
               confirmTransData.transactionStatus = 'Completed'; 
               confirmTransData.reversalStatus = ''; 
               confirmTransData.senderName = data.CustomObject.debitParty.accountTitle; 
               confirmTransData.senderBankName = ''; 
               confirmTransData.senderAccount = data.CustomObject.debitParty.iban;
               confirmTransData.reasonOfFailure = ''; 
               confirmTransData.reversedTrasactionID = ''; 
               confirmTransData.reversedReason = ''; 
               confirmTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
               confirmTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
               confirmTransData.stan = data.Result.TransactionID;
               confirmTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
               confirmTransData.channel = data.Header.SubChannel;
              console.log(JSON.stringify(confirmTransData));
             return { confirmTransData };
          } else {
            return null;
          }
        }
        catch(err){
          console.log('error -> getIBFTIncomingConfirmMapping');
          console.log(err);
          return null;
        }
    }
    
    getIBFTOutgoingInitMapping(data) {
        let initTransData= {} ;
        try { 
          logger.info({ event: 'Entered function', functionName: 'getIBFTOutgoingInitMapping in class dataMapping'});
          // logger.info('Inside the Data Mapping function-> getIBFTOutgoingInitMapping');
          console.log(data);
          if (data.Result.ResultCode == 0) {
    
               initTransData.transactionObjective = data.CustomObject.PurposeOfRemittance;
               initTransData.transactionIDJazzcash = data.Result.TransactionID;
               initTransData.transactionIDEasyPaisa = '';
               
               initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
               if (initTransData.transactionDate !== ''){
                initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
               }
    
               initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || '';
               if (initTransData.transactionTime !== ''){
                const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
                initTransData.transactionTime = initTransData.transactionDate + " " + time;      
               }
              //  initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''
              //  initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
               
               initTransData.beneficiaryMsisdn = data?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'ReceiverMSISDN';})?.Value || '';
               initTransData.beneficiaryBankName = 'EasyPaisa';
             
               initTransData.senderMsisdn = data.CustomObject.SenderMsisdn;
               initTransData.beneficiaryBankAccountTitle = data.CustomObject.BeneficiaryBankAccountTitle;
               initTransData.beneficiaryBankAccount = data.CustomObject.BeneficiaryBankName;
               initTransData.beneficiaryBankAccountNumber = data?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'Rec_BankAccount_number';})?.Value || '';
             
               initTransData.senderLevel = data.CustomObject.IdentityType;
               initTransData.senderCnic = data.CustomObject.SenderCNIC;
               initTransData.senderName = data.CustomObject.SenderAccountTitle;
    
               initTransData.receiverMsisdn =  data?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'ReceiverMSISDN';})?.Value || '';
               initTransData.initiatorMsisdn = data.CustomObject.SenderMsisdn;
               initTransData.initiatorCity= '';
               initTransData.initiatorRegion = '';
               initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
               initTransData.transactionStatus = 'Pending'; 
               initTransData.reasonOfFailure = ''; 
               initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
               initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
               initTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
               initTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
               initTransData.stan = data.Result.TransactionID;
               initTransData.currentBalance = 0;
               initTransData.reversalStatus = ''; 
               initTransData.channel = data.Header.SubChannel;
    
              console.log("contextData");
              console.log(JSON.stringify(initTransData));
             return { initTransData };
          } else {
            return null;
          }
        }
        catch(err){
          console.log('error -> getIBFTOutgoingInitMapping');
          console.log(err);
          return null;
        }
    }
    
    getIBFTOutgoingConfirmMapping(data) {
        let confirmTransData = {};
        try{ 
          logger.info({ event: 'Entered function', functionName: 'getIBFTOutgoingConfirmMapping in class dataMapping'});
          console.log(data);
          if (data.Result.ResultCode == 0) {
    
            confirmTransData.transactionIDEasyPaisa = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';
            confirmTransData.transactionID = data.Result.TransactionID;
            
            confirmTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
            if (confirmTransData.transactionDate !== ''){
             confirmTransData.transactionDate = moment(confirmTransData.transactionDate).format('YYYY-MM-DD');           
            }
    
            confirmTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
            if (confirmTransData.transactionTime !== ''){
             const time = moment(confirmTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
             confirmTransData.transactionTime = confirmTransData.transactionDate + " " + time;      
            }
            confirmTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
            confirmTransData.transactionStatus = 'Completed'; 
            confirmTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
            confirmTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
            confirmTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
            confirmTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
            confirmTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
           
           console.log(JSON.stringify(confirmTransData));
          return { confirmTransData };
          } else {
            return null;
          }
        }
        catch(err){
          console.log('error -> getIBFTOutgoingConfirmMapping');
          console.log(err);
          return null;
        }
    }  
}
export default new dataMapping();
