import logger from '../../util/logger';
import moment from 'moment';
var _ = require('lodash');

class dataMapping {
    constructor() {}


    getIBFTIncomingInitMapping(data) {
      let initTransData = {};
      try { 

        logger.info({ event: 'Entered function', functionName: 'getIBFTIncomingInitMapping in class dataMapping'});
        logger.debug(data);

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

          initTransData.reversedTrasactionID = ''; 
          initTransData.reversedReason = ''; 
          initTransData.reasonOfFailure = '';

          initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
          initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
          initTransData.stan = data.CustomObject.senderTransactionID;
          initTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
          initTransData.channel = data.Header.Channel;
          logger.debug(JSON.stringify(initTransData));

          return { initTransData };

        }
        else {
          logger.debug('Failure scenario for getIBFTIncomingInitMapping');
        
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
          initTransData.transactionStatus = 'Failed'; 
          initTransData.reversalStatus = ''; 
          initTransData.senderName = data.CustomObject.debitParty.accountTitle; 
          initTransData.senderBankName = 'Easy Paisa'; 
          initTransData.senderAccount = data.CustomObject.debitParty.iban;
          
          initTransData.reversedTrasactionID = ''; 
          initTransData.reversedReason = '';
          
          let reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'FailedReason';})?.Value || '';
          if (typeof(reasonOfFailure) === 'object' && obj !== null) {
            reasonOfFailure = '';
          }

          initTransData.reasonOfFailure = reasonOfFailure;
          
          initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
          initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
          initTransData.stan = data.CustomObject.senderTransactionID;
          initTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
          initTransData.channel = data.Header.Channel;
          logger.debug(JSON.stringify(initTransData));

          return { initTransData };

        }

      } catch(err){
        logger.debug('error -> getIBFTIncomingInitMapping');
        logger.debug(err);
        return null;
      }
    }

    getIBFTIncomingConfirmMapping(data) {
        let confirmTransData={};
        try { 
          logger.info({ event: 'Entered function', functionName: 'getIBFTIncomingConfirmMapping in class dataMapping'});
          logger.debug(data);

          if (data.Result.ResultCode == 0) {
    
               confirmTransData.transactionIDEasyPaisa = data.CustomObject.senderTransactionID;
               confirmTransData.transactionIDEasyJazzcash = data.Result.TransactionID;
               confirmTransData.financialIDEasyPaisa =  data.CustomObject.senderFinancialID;

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
               logger.debug(JSON.stringify(confirmTransData));
               return { confirmTransData };
          } else {
               logger.debug("Failure scenario for getIBFTIncomingConfirmMapping()");

               confirmTransData.transactionIDEasyPaisa = data.CustomObject.senderTransactionID;
               confirmTransData.transactionIDEasyJazzcash = data.Result.TransactionID;
               confirmTransData.financialIDEasyPaisa =  data.CustomObject.senderFinancialID;

               if (confirmTransData.transactionIDEasyJazzcash == '0000000000000000') {
                  confirmTransData.transactionIDEasyJazzcash = data?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'TransID';})?.Value || '';
               }
               
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
               
               confirmTransData.transactionStatus = 'Failed'; 
               confirmTransData.reversalStatus = ''; ;
                
               let reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'FailedReason';})?.Value || '';
               if (typeof(reasonOfFailure) === 'object' && obj !== null) {
                 reasonOfFailure = '';
               }
               confirmTransData.reasonOfFailure = reasonOfFailure;

               confirmTransData.reversedTrasactionID = ''; 
               confirmTransData.reversedReason = ''; 
               confirmTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
               confirmTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
               confirmTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
               logger.debug(JSON.stringify(confirmTransData));
               return { confirmTransData };
          }
        } catch(err){
          logger.debug('error -> getIBFTIncomingConfirmMapping');
          logger.debug(err);
          return null;
        }
    }
    
    getIBFTOutgoingInitMapping(data) {
        let initTransData= {} ;
        try { 
          logger.info({ event: 'Entered function', functionName: 'getIBFTOutgoingInitMapping in class dataMapping'});
          // logger.info('Inside the Data Mapping function-> getIBFTOutgoingInitMapping');
          logger.debug(data);
          if (data.Result.ResultCode == 0) {
    
               initTransData.transactionObjective = data.CustomObject.PurposeOfRemittance;
               initTransData.financialIDJazzcash = data.Result.TransactionID;
               initTransData.transactionIDJazzcash = '';

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
              
               initTransData.reversalStatus = ''; 
              
               initTransData.stan = "";
               initTransData.currentBalance = 0;
               initTransData.channel = data.Header.SubChannel;
    
               logger.debug("contextData");
               logger.debug(JSON.stringify(initTransData));
             return { initTransData };
          } else {     
              logger.debug("Failure scenario for getIBFTOutgoingInitMapping()");

              initTransData.transactionObjective = data.CustomObject.PurposeOfRemittance;
              initTransData.financialIDJazzcash = data.Result.TransactionID;
              initTransData.transactionIDJazzcash = '';

              initTransData.transactionIDEasyPaisa = '';

              initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
              if (initTransData.transactionDate !== '') {
                initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
              }
  
              initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || '';
              if (initTransData.transactionTime !== '') {
                const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
                initTransData.transactionTime = initTransData.transactionDate + " " + time;      
              }
                         
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
              initTransData.transactionStatus = 'Failed'; 
              
              initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
              initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
              initTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
              initTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
             
              initTransData.stan = "";
              initTransData.currentBalance = 0;
              initTransData.channel = data.Header.SubChannel;
             
              let reversalStatus = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'ReversalTID';})?.Value || '';
              if (typeof(reversalStatus) === 'object' && obj !== null) {
                 reversalStatus = '';
              }
              initTransData.reversalStatus = reversalStatus;

              let reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'errorDescription';})?.Value || '';
              if (typeof(reasonOfFailure) === 'object' && obj !== null) {
                reasonOfFailure = '';
              }
              
              if (reasonOfFailure == '') {
                reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'FailedReason';})?.Value || '';
                if (typeof(reasonOfFailure) === 'object' && obj !== null) {
                  reasonOfFailure = '';
                }
              }
              initTransData.reasonOfFailure = reasonOfFailure;

              logger.debug("contextData");
              logger.debug(JSON.stringify(initTransData));
              return { initTransData };
          }
        }
        catch(err){
          logger.debug('error -> getIBFTOutgoingInitMapping');
          logger.debug(err);
          return null;
        }
    }
    
    getIBFTOutgoingConfirmMapping(data) {
        let confirmTransData = {};
        try{ 
          logger.info({ event: 'Entered function', functionName: 'getIBFTOutgoingConfirmMapping in class dataMapping'});
          logger.debug(data);
          if (data.Result.ResultCode == 0) {
    
            confirmTransData.transactionIDEasyPaisa = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'receiverFinancialID';})?.Value || '';
            confirmTransData.financialIDJazzcash = data.Result.TransactionID;
            confirmTransData.transactionIDJazzcash = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';
             
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
           
            confirmTransData.reversalStatus = '';
            confirmTransData.reasonOfFailure = '';

            confirmTransData.stan =  data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';

           logger.debug(JSON.stringify(confirmTransData));
            return { confirmTransData };
          } else {
            logger.debug("Failure scenario for getIBFTOutgoingConfirmMapping()");
            
            confirmTransData.transactionIDEasyPaisa = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'receiverFinancialID';})?.Value || '';
            confirmTransData.financialIDJazzcash = data.Result.TransactionID;
            confirmTransData.transactionIDJazzcash = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';
             
            confirmTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
            if (confirmTransData.transactionDate !== ''){
             confirmTransData.transactionDate = moment(confirmTransData.transactionDate).format('YYYY-MM-DD');           
            }
    
            confirmTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
            if (confirmTransData.transactionTime !== ''){
             const time = moment(confirmTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
             confirmTransData.transactionTime = confirmTransData.transactionDate + " " + time;      
            }

            if (confirmTransData.financialIDJazzcash == '0000000000000000') {
              confirmTransData.financialIDJazzcash = data?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'TransID';})?.Value || '';
            }

            confirmTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
            confirmTransData.transactionStatus = 'Failed'; 
            confirmTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
            confirmTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
            confirmTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
            confirmTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
            confirmTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
           
            confirmTransData.stan =  data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';

            let reversalStatus = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'ReversalTID';})?.Value || '';
              if (typeof(reversalStatus) === 'object' && obj !== null) {
                 reversalStatus = '';
              }
              confirmTransData.reversalStatus = reversalStatus;

              let reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'errorDescription';})?.Value || '';
              if (typeof(reasonOfFailure) === 'object' && obj !== null) {
                reasonOfFailure = '';
              }
              
              if (reasonOfFailure == '') {
                reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'FailedReason';})?.Value || '';
                if (typeof(reasonOfFailure) === 'object' && obj !== null) {
                  reasonOfFailure = '';
                }
              }
              confirmTransData.reasonOfFailure = reasonOfFailure;
      
              logger.debug(JSON.stringify(confirmTransData));
              return { confirmTransData };
          }
        }
        catch(err){
          logger.debug('error -> getIBFTOutgoingConfirmMapping');
          logger.debug(err);
          return null;
        }
    }
    
    getIBFTMobileOutgoingInitMapping(data) {
      let initTransData= {} ;
      try { 
        logger.info({ event: 'Entered function', functionName: 'getIBFTMobileOutgoingInitMapping in class dataMapping'});
        // logger.info('Inside the Data Mapping function-> getIBFTOutgoingInitMapping');
        logger.debug(data);
        if (data.Result.ResultCode == 0) {
  
             initTransData.transactionObjective = data.CustomObject.PurposeOfRemittance;
             initTransData.financialIDJazzcash = data.Result.TransactionID;
             initTransData.transactionIDJazzcash = '';
             initTransData.transactionIDEasyPaisa = '';

             initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || '';          
             if (initTransData.transactionDate !== ''){
              initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
             }
  
             initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || '';
             if (initTransData.transactionTime !== ''){
              const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
              initTransData.transactionTime = initTransData.transactionDate + " " + time;      
             }

             initTransData.beneficiaryMsisdn = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'ReceiverMSISDN';})?.Value || '';
             initTransData.beneficiaryBankName = 'EasyPaisa';
           
             initTransData.senderMsisdn = data.Header.Identity.Initiator.Identifier;
             initTransData.beneficiaryBankAccountTitle = "";
             initTransData.beneficiaryBankAccount = "";
             initTransData.beneficiaryBankAccountNumber = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'Rec_BankAccount_number';})?.Value || '';
           
             initTransData.senderLevel = "";
             initTransData.senderCnic = "";
             initTransData.senderName = "";
  
             initTransData.receiverMsisdn = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'ReceiverMSISDN';})?.Value || '';
             initTransData.initiatorMsisdn = data.Header.Identity.Initiator.Identifier;
             
             initTransData.initiatorCity= '';
             initTransData.initiatorRegion = '';
             
             initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
             initTransData.transactionStatus = 'Pending'; 

             initTransData.stan = '';
             initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
             initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
             initTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
             initTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
            
             initTransData.currentBalance = 0;
             initTransData.channel = data.Header.SubChannel;

             initTransData.reversalStatus = ''; 
             initTransData.reasonOfFailure = '';
  
            logger.debug("contextData");
            logger.debug(JSON.stringify(initTransData));
           return { initTransData };
        } else {

          initTransData.transactionObjective = data.CustomObject.PurposeOfRemittance;
          initTransData.financialIDJazzcash = data.Result.TransactionID;
          initTransData.transactionIDJazzcash = '';
          initTransData.transactionIDEasyPaisa = '';

          initTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || '';          
          if (initTransData.transactionDate !== ''){
           initTransData.transactionDate = moment(initTransData.transactionDate).format('YYYY-MM-DD');           
          }

          initTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || '';
          if (initTransData.transactionTime !== ''){
           const time = moment(initTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
           initTransData.transactionTime = initTransData.transactionDate + " " + time;      
          }

          initTransData.beneficiaryMsisdn = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'ReceiverMSISDN';})?.Value || '';
          initTransData.beneficiaryBankName = 'EasyPaisa';
        
          initTransData.senderMsisdn = data.Header.Identity.Initiator.Identifier;
          initTransData.beneficiaryBankAccountTitle = "";
          initTransData.beneficiaryBankAccount = "";
          initTransData.beneficiaryBankAccountNumber = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'Rec_BankAccount_number';})?.Value || '';
        
          initTransData.senderLevel = "";
          initTransData.senderCnic = "";
          initTransData.senderName = "";

          initTransData.receiverMsisdn = data?.Request?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'ReceiverMSISDN';})?.Value || '';
          initTransData.initiatorMsisdn = data.Header.Identity.Initiator.Identifier;
          
          initTransData.initiatorCity= '';
          initTransData.initiatorRegion = '';
          
          initTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
          initTransData.transactionStatus = 'Failed'; 
          initTransData.stan = '';
          initTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
          initTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
          initTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
          initTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
         
          initTransData.currentBalance = 0;
          initTransData.channel = data.Header.SubChannel;

          let reversalStatus = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'ReversalTID';})?.Value || '';
          if (typeof(reversalStatus) === 'object' && obj !== null) {
              reversalStatus = '';
          }

          let reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'errorDescription';})?.Value || '';
          if (typeof(reasonOfFailure) === 'object' && obj !== null) {
            reasonOfFailure = '';
          }
    
          if (reasonOfFailure == '') {
            reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'FailedReason';})?.Value || '';
            if (typeof(reasonOfFailure) === 'object' && obj !== null) {
              reasonOfFailure = '';
            }
          }

          initTransData.reversalStatus = reversalStatus;
          initTransData.reasonOfFailure = reasonOfFailure;

         logger.debug("contextData");
         logger.debug(JSON.stringify(initTransData));
        return { initTransData };
        }
      }
      catch(err){
        logger.debug('error -> getIBFTOutgoingInitMapping');
        logger.debug(err);
        return null;
      }
    }
  
    getIBFTMobileOutgoingConfirmMapping(data) {
        let confirmTransData = {};
        try { 
          logger.info({ event: 'Entered function', functionName: 'getIBFTMobileOutgoingConfirmMapping in class dataMapping'});
          logger.debug(data);
         
          if (data.Result.ResultCode == 0) {
    
            confirmTransData.transactionIDEasyPaisa = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'receiverFinancialID';})?.Value || '';
        
            confirmTransData.financialIDJazzcash = data.Result.TransactionID;
            confirmTransData.transactionIDJazzcash = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';
            
            confirmTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
            if (confirmTransData.transactionDate !== '') {
              confirmTransData.transactionDate = moment(confirmTransData.transactionDate).format('YYYY-MM-DD');           
            }
    
            confirmTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
            if (confirmTransData.transactionTime !== '') {
              const time = moment(confirmTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
              confirmTransData.transactionTime = confirmTransData.transactionDate + " " + time;      
            }

            confirmTransData.beneficiaryBankAccountTitle = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'BeneficiaryName';})?.Value || ''

            confirmTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
            confirmTransData.transactionStatus = 'Completed'; 
            confirmTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
            confirmTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
            confirmTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
            confirmTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
            confirmTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
          
            confirmTransData.reversalStatus = '';
            confirmTransData.reasonOfFailure = '';

            confirmTransData.stan =  data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';

            logger.debug(JSON.stringify(confirmTransData));
            return { confirmTransData };
          } else {
            confirmTransData.transactionIDEasyPaisa = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'receiverFinancialID';})?.Value || '';
        
            confirmTransData.financialIDJazzcash = data.Result.TransactionID;
            confirmTransData.transactionIDJazzcash = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';
            
            if (confirmTransData.financialIDJazzcash == '0000000000000000') {
              confirmTransData.financialIDJazzcash = data?.Transaction?.Parameters?.Parameter?.find((param) => {return param.Key == 'TransID';})?.Value || '';
            }

            confirmTransData.transactionDate = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndDate';})?.Value || ''          
            if (confirmTransData.transactionDate !== '') {
              confirmTransData.transactionDate = moment(confirmTransData.transactionDate).format('YYYY-MM-DD');           
            }
    
            confirmTransData.transactionTime = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'TransEndTime';})?.Value || ''
            if (confirmTransData.transactionTime !== '') {
              const time = moment(confirmTransData.transactionTime, 'HHmmss').format('HH:mm:ss');    
              confirmTransData.transactionTime = confirmTransData.transactionDate + " " + time;      
            }

            confirmTransData.beneficiaryBankAccountTitle = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'BeneficiaryName';})?.Value || ''

            confirmTransData.amount = Number(data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Amount';})?.Value || '0');
            confirmTransData.transactionStatus = 'Failed'; 
            confirmTransData.fee = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fee';})?.Value || '0');
            confirmTransData.fed = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Fed';})?.Value || '0');
            confirmTransData.commission = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Commission';})?.Value || '0');
            confirmTransData.wht = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'WHT';})?.Value || '0');
            confirmTransData.currentBalance = Number(data.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'Balance';})?.Value || '0');
          
            confirmTransData.stan =  data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'senderTransactionID';})?.Value || '';

            let reversalStatus = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'ReversalTID';})?.Value || '';
            if (typeof(reversalStatus) === 'object' && obj !== null) {
               reversalStatus = '';
            }
            confirmTransData.reversalStatus = reversalStatus;

            let reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'errorDescription';})?.Value || '';
            if (typeof(reasonOfFailure) === 'object' && obj !== null) {
              reasonOfFailure = '';
            }
            
            if (reasonOfFailure == '') {
              reasonOfFailure = data?.Result?.ResultParameters?.ResultParameter?.find((param) => {return param.Key == 'FailedReason';})?.Value || '';
              if (typeof(reasonOfFailure) === 'object' && obj !== null) {
                reasonOfFailure = '';
              }
            }
            confirmTransData.reasonOfFailure = reasonOfFailure;

            logger.debug(JSON.stringify(confirmTransData));
            return { confirmTransData };
          }
        }
        catch(err){
          logger.debug('error -> getIBFTOutgoingConfirmMapping');
          logger.debug(err);
          return null;
        }
    }
    
    async getProfileResponse(data) {
      return {
        _id: data._id,
        identityID: data.identityID,
        level: data.level,
        msisdn: data.msisdn,
        cnic: data.cnic,
        uID: data.uID ? data.uID : data._id,
        dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : null,
        firstNameEn: data.firstNameEn,
        firstNameUr: data.firstNameUr,
        lastNameEn: data.lastNameEn,
        lastNameUr: data.lastNameUr,
        nickName: data.nickName ? data.nickName : '',
        email: data.email ? data.email : null,
        profileImageURL: data.profileImageURL ? data.profileImageURL : null,
        language: data.language,
        customerType: data.customerType,
        firstLoginTS: data.firstLoginTS ? data.firstLoginTS : null,
        signupBonusTS: data.signupBonusTS ? data.signupBonusTS : null,
        scope: data.scope,
        requestToPay: data.requestToPay != null ? data.requestToPay : null,
        registrationDate: data.registrationDate ? data.registrationDate : null,
        minorMigrationRequired: data.minorMigrationRequired ? data.minorMigrationRequired: false,
        accountType: data.accountType ? data.accountType : "",
        hitCount: data.hitCount ? data.hitCount : null,
        cnicExpiryschedulerDate: data.cnicExpiryschedulerDate ? data.cnicExpiryschedulerDate : null,
        cnicExpiry: data.cnicExpiry ? data.cnicExpiry : null
  
      };
    }
  
    async getMerchantProfileResponse(data) {
  
      let expiryDate = null;
  
      if (data.level && data.createTS && data.level.toLowerCase() == 'm0') {
        expiryDate = moment(data.createTS).add(parseInt(REGISTRATION_EXPIRY_DAYS), 'd');
        logger.debug({
          expiryDate
        });
      }
  
      return {
        identityID: data.identityID,
        level: data.level,
        msisdn: data.msisdn,
        scope: data.scope,
        cnic: data.cnic,
        cnicCRM: data.cnicCRM,
        uID: data.uID ? data.uID : data._id,
        dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : null,
        firstNameEn: data.firstNameEn,
        firstNameUr: data.firstNameUr,
        lastNameEn: data.lastNameEn,
        lastNameUr: data.lastNameUr,
        email: data.email ? data.email : null,
        profileImageURL: data.profileImageURL ? data.profileImageURL : null,
        businessDetails: {
          businessName: data.businessDetails.businessName ? data.businessDetails.businessName : null,
          merchantType: data.businessDetails.merchantType ? data.businessDetails.merchantType : null,
          businessAddress: data.businessDetails.businessAddress ? data.businessDetails.businessAddress : null,
          website: data.businessDetails.website ? data.businessDetails.website : null,
          shortCode: data.businessDetails.shortCode ? data.businessDetails.shortCode : null,
          operatorID: data.businessDetails.operatorID ? data.businessDetails.operatorID : null,
          userName: data.businessDetails.userName ? data.businessDetails.userName : null,
          acceptedTermsAndCondition: data.businessDetails.acceptedTermsAndCondition == null ? false : data.businessDetails.acceptedTermsAndCondition,
          businessCity: data.businessDetails.businessCity ? data.businessDetails.businessCity : null,
          expactedMonthlyIncome: data.businessDetails.expactedMonthlyIncome ? data.businessDetails.expactedMonthlyIncome : null,
          merchantCode: data.businessDetails.merchantCode ? data.businessDetails.merchantCode : null,
          nearestLandmark: data.businessDetails.nearestLandmark ? data.businessDetails.nearestLandmark : null,
          businessEmail: data.businessDetails.businessEmail ? data.businessDetails.businessEmail: null,
          isEmailRequestSubmitted: data.businessDetails.isEmailRequestSubmitted == null ? false : data.businessDetails.isEmailRequestSubmitted, 
          businessLogo: data.businessDetails.businessLogo ? data.businessDetails.businessLogo: null,
          longitude: data.businessDetails.longitude ? data.businessDetails.longitude :null,
          latitude: data.businessDetails.latitude ? data.businessDetails.latitude :null,
          gpsLocation: data.businessDetails.gpsLocation ? data.businessDetails.gpsLocation :null,
          businessGpsLocation: data.businessDetails.businessGpsLocation ? data.businessDetails.businessGpsLocation :null
        },
        language: data.language ? data.language : null,
        customerType: data.customerType,
        firstLoginTS: data.firstLoginTS ? data.firstLoginTS : null,
        signupBonusTS: data.signupBonusTS ? data.signupBonusTS : null,
        requestToPay: data.requestToPay != null ? data.requestToPay : null,
        registrationDate: data.registrationDate ? data.registrationDate : null,
        expiryDate: expiryDate ? expiryDate : null,
        registeredVia: data.registeredVia,
        nadraVerificationID: data.nadraVerificationID,
        cnicIssueDate: data.cnicIssueDate,
        motherMaidenName: data.motherMaidenName,
        addressEn: data.addressEn,
        birthPlace: data.birthPlace,
        cnicExpiry: data.cnicExpiry,
        registrationStage: data.registrationStage,
        userEnteredMotherMaiden: data.userEnteredMotherMaiden,
        userEnteredPlaceOfBirth: data.userEnteredPlaceOfBirth,
        cnicBackUrl: data.cnicBackUrl,
        cnicFrontUrl: data.cnicFrontUrl,
        selfieUrl: data.selfieUrl,
        hitCount: data.hitCount ? data.hitCount : null
      };
    }

}
export default new dataMapping();
