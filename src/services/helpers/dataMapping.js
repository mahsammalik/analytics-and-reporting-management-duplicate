import logger from '../../util/logger';
import moment from 'moment';
var _ = require('lodash');

class dataMapping {
    constructor() {}


    getIBFTIncomingInitMapping(data) {
      let initTransData = {};
      try { 

        logger.info({ event: 'Entered function', functionName: 'getIBFTIncomingInitMapping in class dataMapping'});
        console.log(data);

        if (data.Result.ResultCode == 0) {

          initTransData.transactionIDEasyPaisa = data.CustomObject.senderTransactionID;
          initTransData.financialIDEasyPaisa = '';
          initTransData.transactionIDEasyJazzcash = data.Result.TransactionID;         
          initTransData.paymentPurpose = '';

          initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
          if (initTransData.transactionDate !== ''){
            initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
          }

          initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
          if (initTransData.transactionTime !== ''){
           const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
           initTransData.transactionTime = initTransData.transactionDate + " " + time;      
          }

          initTransData.receiverMsisdn = data.CustomObject.creditParty.msisdn;
          initTransData.receiverCnic = data.CustomObject.receiverCnic;
          initTransData.receiverName = data.CustomObject.receiverAccountTitle;
          initTransData.identityLevel =  data.CustomObject.identityType;
          initTransData.region = ''; 
          initTransData.city = ''; 
          initTransData.address = ''; 
          initTransData.amount = Number(data.CustomObject.amount);
          initTransData.transactionStatus = 'Pending'; 
          initTransData.reversalStatus = ''; 
          initTransData.senderName = data.CustomObject.debitParty.accountTitle; 
          initTransData.senderBankName = 'Easy Paisa'; 
          initTransData.senderAccount = data.CustomObject.debitParty.iban;
          initTransData.reasonOfFailure = ''; 
          initTransData.reversedTrasactionID = ''; 
          initTransData.reversedReason = ''; 
          initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
          initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
          initTransData.stan = data.CustomObject.senderTransactionID;
          initTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
          initTransData.channel = data.Header.Channel;
          console.log(JSON.stringify(initTransData));

          return { initTransData };

        } else {
          return null;
        }

      } catch(err){
        console.log('error -> getIBFTIncomingInitMapping');
        console.log(err);
        return null;
      }
    }

    getIBFTIncomingConfirmMapping(data) {
        let confirmTransData={};
        try { 
          logger.info({ event: 'Entered function', functionName: 'getIBFTIncomingConfirmMapping in class dataMapping'});
          console.log(data);
          if (data.Result.ResultCode == 0) {
    
               confirmTransData.transactionIDEasyPaisa = data.CustomObject.senderTransactionID;
               confirmTransData.transactionIDEasyJazzcash = data.Result.TransactionID;
               confirmTransData.financialIDEasyPaisa =  data.CustomObjectsenderFinancialID;

               confirmTransData.paymentPurpose = data.CustomObject.paymentPurpose;         

               confirmTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || '';       
               if (confirmTransData.transactionDate !== ''){
                confirmTransData.transactionDate = moment(confirmTransData.transactionDate).format('YYYY-MM-DD');           
               }
    
               confirmTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || '';
               if (confirmTransData.transactionTime !== ''){
                const time = moment(confirmTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
                confirmTransData.transactionTime = confirmTransData.transactionDate + " " + time;      
               }
               
               confirmTransData.transactionStatus = 'Completed'; 
               confirmTransData.reversalStatus = ''; ;
               confirmTransData.reasonOfFailure = ''; 
               confirmTransData.reversedTrasactionID = ''; 
               confirmTransData.reversedReason = ''; 
               confirmTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
               confirmTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
               confirmTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
              console.log(JSON.stringify(confirmTransData));
             return { confirmTransData };
          } else {
            return null;
          }
        } catch(err){
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
               
               initTransData.beneficiaryMsisdn = data.CustomObject.ReceiverMSISDN;
               initTransData.beneficiaryBankName = 'EasyPaisa';
             
               initTransData.senderMsisdn = data.CustomObject.SenderMsisdn;
               initTransData.beneficiaryBankAccountTitle = data.CustomObject.BeneficiaryBankAccountTitle;
               initTransData.beneficiaryBankAccount = data.CustomObject.BeneficiaryBankName;
               initTransData.beneficiaryBankAccountNumber = data.CustomObject.BankAccountNumber;
             
               initTransData.senderLevel = data.CustomObject.IdentityType;
               initTransData.senderCnic = data.CustomObject.SenderCNIC;
               initTransData.senderName = data.CustomObject.SenderAccountTitle;
    
               initTransData.receiverMsisdn =   data.CustomObject.ReceiverMSISDN;
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