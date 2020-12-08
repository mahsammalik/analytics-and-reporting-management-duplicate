import DB2Connection from '../util/DB2Connection';
import logger from '../util/logger';
import dataMapping from './helpers/dataMapping';
import Excel from 'exceljs';
import responseCodeHandler from '../util/responseCodeHandler';
import _ from 'lodash';

class ExcelExportService {
  constructor() {
    this.jazzcashIncomingExport = this.jazzcashIncomingExport.bind(this);
    this.jazzcashOutgoingExport = this.jazzcashOutgoingExport.bind(this);
  }

  async jazzcashIncomingExport(req, res) {
    logger.debug({ event: 'Entered function', functionName: 'jazzcashIncomingExport in class ExcelExportService' });
    let clientResponse = {};
    try {
     
     const initBody = {
        Header: {
          Channel: 'App',
          SubChannel: 'USSD',
          UseCase: 'DirectIBFT',
          Identity: {
            Caller: {
              ThirdPartyID: 'ibm_consumer_app',
            },
            Initiator: {
              IdentifierType: '1',
              Identifier: '923011552244',
            },
            ReceiverParty: {
              IdentifierType: '1',
              Identifier: '923458505731',
            },
          },
          AppConnectUUID: '054c7dc2-371d-11eb-bd14-ac16a4250000',
        },
        Request: {
          Transaction: {
            CommandID: 'InitTrans_DirectIBFTOutgoing',
            OriginatorConversationID: '90fc4527T1607188333501',
            ConversationID: 'JC_20201205_118ac67aca357fe9f458',
            Parameters: {
              Parameter: [
                {
                  Key: 'Amount',
                  Value: '2',
                },
                {
                  Key: 'ChannelCode',
                  Value: '1031',
                },
                {
                  Key: 'BankCode',
                  Value: '59',
                },
                {
                  Key: 'Front_Channel',
                  Value: 'EasyPaisa',
                },
                {
                  Key: 'ReceiverMSISDN',
                  Value: '923465055819',
                },
                {
                  Key: 'Rec_BankAccount_number',
                  Value: '923465055819',
                },
                {
                  Key: 'Type',
                  Value: '0188',
                },
              ],
            },
            Timestamp: '20201205171214',
          },
        },
        Result: {
          ResultType: '1',
          ResultCode: '0',
          ResultDesc: 'Process service request successfully.',
          TransactionID: '010711228976',
          ResultParameters: {
            ResultParameter: [
              {
                Key: 'Amount',
                Value: '2.00',
              },
              {
                Key: 'TransEndDate',
                Value: '20201205',
              },
              {
                Key: 'Fee',
                Value: '10.00',
              },
              {
                Key: 'TransEndTime',
                Value: '221214',
              },
            ],
          },
        },
        CustomObject: {
          senderMsisdn: '923011552244',
          accountNumber: '923465055819',
          amount: 2,
          receiverMsisdn: '923465055819',
          paymentPurpose: '0188',
          bankCode: '59',
          reserveParameterOne: 'reserve parameter',
          reserveParameterTwo: 'reserve parameter',
          senderCNIC: '4240185266317',
          senderAccountTitle: 'Ahad Sheikh',
          identityType: '1000',
          beneficiaryBankName: 'TMFB',
          beneficiaryBankAccountTitle: 'TAHREMWASEEM',
        },
      };
      const confirmBody = {
        Header: {
          Channel: 'App',
          SubChannel: 'USSD',
          UseCase: 'DirectIBFT',
          ThirdPartyType: 'consumerApp',
          Identity: {
            Caller: {
              ThirdPartyID: 'ibm_consumer_app',
            },
            Initiator: {
              IdentifierType: 1,
              Identifier: '923011552244',
            },
          },
          AppConnectUUID: '88f84ae8-3709-11eb-a151-ac16a4230000',
        },
        Request: {
          Transaction: {
            CommandID: 'ComfirmTransaction',
            OriginatorConversationID: '0d6d7167T1607179947868',
            Parameters: {
              Parameter: [
                {
                  Key: 'TransID',
                  Value: '010711228976',
                },
                {
                  Key: 'IsSuccess',
                  Value: 'true',
                },
                {
                  Key: 'ChannelCode',
                  Value: '1107',
                },
              ],
            },
            ReferenceData: {
              ReferenceItem: [
                {
                  Key: 'Channel',
                  Value: 'USSD',
                },
              ],
            },
            Timestamp: '20201205145244',
          },
        },
        Result: {
          ResultType: '0',
          ResultCode: '0',
          ResultDesc: 'Process service request successfully.',
          TransactionID: '010711228976',
          ResultParameters: {
            ResultParameter: [
              {
                Key: 'TransEndDate',
                Value: '20201205',
              },
              {
                Key: 'Fee',
                Value: '10.00',
              },
              {
                Key: 'TransEndTime',
                Value: '195244',
              },
              {
                Key: 'Balance',
                Value: '7990.90',
              },
              {
                Key: 'BeneficiaryName',
                Value: 'AKSA Dev Retailer',
              },
              {
                Key: 'Amount',
                Value: '2.00',
              },
              {
                Key: 'senderTransactionID',
                Value: '0d6d7167T1607179947868',
              },
            ],
          },
        },
        CustomObject: {
          senderMsisdn: '923011552244',
          bankCode: '59',
          originatorConversationID: '0d6d7167T1607179947868',
          transactionID: '010711228373',
          reserveParameterOne: 'reserve parameter',
          reserveParameterTwo: 'reserve parameter',
        },
      };

    //   const response = dataMapping.getIBFTOutgoingInitMapping(initBody);
    //   console.log(response);

    //   const response = dataMapping.getIBFTOutgoingConfirmMapping(
    //     confirmBody
    //   );
    //   console.log(response);

    //   const db2response = await DB2Connection.addOutgoingTransaction(
    //     response.initTransData
    //   );
    //   console.log(db2response);

    //   const db2response = await DB2Connection.updateOutgoingTransaction(
    //     response.confirmTransData
    //   );
    //   console.log(db2response);

      // const response = await DB2Connection.getIncomingTransaction();
      const getIncomingTransactionObjects = await DB2Connection.getIncomingTransactions(req.params.startDate, req.params.endDate);
      console.log(JSON.stringify(getIncomingTransactionObjects));

      if (getIncomingTransactionObjects == null) {
        clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
        return res.status(200).send(this.getResponse(clientResponse));
      }

      if (getIncomingTransactionObjects.length == 0) {
        clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
        clientResponse.message_en = 'No data found against the parameters provided';
        return res.status(200).send(this.getResponse(clientResponse));
      }

      this.csvExportIncoming(getIncomingTransactionObjects, res);
    } catch (error) {
      logger.error({ event: 'Error thrown', functionName: 'jazzcashIncomingExport in class ExcelExportService', 'error': { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, query: req.query });
      logger.info({ event: 'Exited function', functionName: 'jazzcashIncomingExport in class ExcelExportService' });
      clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
      return res.status(200).send(this.getResponse(clientResponse));
    }
  }

  async jazzcashOutgoingExport(req, res) {
    logger.debug({ event: 'Entered function', functionName: 'jazzcashOutgoingExport in class ExcelExportService' });
    let clientResponse = {};
    try {

      const getOutgoingTransactionObjects = await DB2Connection.getOutgoingTransactions(req.params.startDate, req.params.endDate);
      console.log(JSON.stringify(getOutgoingTransactionObjects));

      if (getOutgoingTransactionObjects == null) {
        clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
        return res.status(200).send(this.getResponse(clientResponse));
      }

      if (getOutgoingTransactionObjects.length == 0) {
        clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
        clientResponse.message_en = 'No data found against the parameters provided';
        return res.status(200).send(this.getResponse(clientResponse));
      }

      this.csvExportOutgoing(getOutgoingTransactionObjects, res);
    } catch (error) {
      logger.error({ event: 'Error thrown', functionName: 'jazzcashIncomingExport in class ExcelExportService', 'error': { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, query: req.query });
      logger.info({ event: 'Exited function', functionName: 'jazzcashIncomingExport in class ExcelExportService' });
      clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
      return res.status(200).send(this.getResponse(clientResponse));
    }
  }

  // Excel Export
  async csvExportIncoming(data, res) {
    try {

      // workbook code.
      const workbook = new Excel.Workbook();
      const incomingTransactionWorkSheet = workbook.addWorksheet('sheet1');

      logger.debug({ event: 'Info Message', functionName: 'Creating sheet Upload for Incoming Transactions'});

      incomingTransactionWorkSheet.getRow(1).values = [
        'TransactionID Easypaisa',
        'TransactionID Jazz Cash',
        'FinancialID Easypaisa',
        'TransactionID Objective',
        'Transaction Date',
        'Transaction Time',
        'Receiver MSISDN',
        'Receiver CNIC',
        'Receiver Name',
        'Identity Level',
        'Region',
        'City',
        'Address',
        'Amount',
        'Transaction Status',
        'Reversal Status',
        'Sender Name',
        'Sender Bank Name',
        'Sender Account',
        'Reason of Failure',
        'Reversed Tx ID',
        'Reversed Reason',
        'Fee',
        'Fed',
        'STAN',
        'Current Balance',
        'Channel'
      ];

      incomingTransactionWorkSheet.getRow(1).height = 10;

      incomingTransactionWorkSheet.columns = [
        { key: 'TransactionID Easypaisa', width: 20 },
        { key: 'TransactionID Jazz Cash', width: 20 },
        { key: 'FinancialID Easypaisa', width: 20 },
        { key: 'TransactionID Objective', width: 20 },
        { key: 'Transaction Date', width: 15 },
        { key: 'Transaction Time', width: 15 },
        { key: 'Receiver MSISDN', width: 20 },
        { key: 'Receiver CNIC', width: 15 },
        { key: 'Receiver Name', width: 15 },
        { key: 'Identity Level', width: 15 },
        { key: 'Region', width: 20 },
        { key: 'City', width: 15 },
        { key: 'Address', width: 15 },
        { key: 'Amount', width: 15 },
        { key: 'Transaction Status', width: 15 },
        { key: 'Reversal Status', width: 20 },
        { key: 'Sender Name', width: 15 },
        { key: 'Sender Bank Name', width: 15 },
        { key: 'Sender Account', width: 15 },
        { key: 'Reason of Failure', width: 20 },
        { key: 'Reversed Tx ID', width: 15 },
        { key: 'Reversed Reason', width: 15 },
        { key: 'Fee', width: 15 },
        { key: 'Fed', width: 20 },
        { key: 'STAN', width: 15 },
        { key: 'Current Balance', width: 15 },
        { key: 'Channel', width: 15 },

      ];

      for (let row in data) {
        incomingTransactionWorkSheet.addRow({
          'TransactionID Easypaisa': data[row][0],
          'TransactionID Jazz Cash': data[row][1],
          'FinancialID Easypaisa': data[row][25],
          'TransactionID Objective': data[row][26],
          'Transaction Date': data[row][2],
          'Transaction Time': data[row][3],
          'Receiver MSISDN': '' + data[row][4],
          'Receiver CNIC': data[row][5],
          'Receiver Name': data[row][6],
          'Identity Level': data[row][7],
          Region: data[row][8],
          City: data[row][9],
          Address: data[row][10],
          Amount: parseFloat(data[row][11]),
          'Transaction Status': data[row][12],
          'Reversal Status': data[row][13],
          'Sender Name': data[row][14],
          'Sender Bank Name': data[row][15],
          'Sender Account': data[row][16],
          'Reason of Failure': data[row][19],
          'Reversed Tx ID': data[row][17],
          'Reversed Reason': data[row][18],
          Fee: parseFloat(data[row][20]),
          Fed: parseFloat(data[row][21]),
          STAN: data[row][22],
          'Current Balance': parseFloat(data[row][23]),
          'Channel': data[row][24]
        });
      }

      const now = new Date();
      const dateTimestamp = now
        .toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '')
        .replace(/:/g, '.');
      const fileName = `IBFT Incoming Transaction-${dateTimestamp}-csvexport.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
      await workbook.csv.write(res);
      res.status(200).end();
    } catch (error) {
        console.log(error);
        logger.error({ event: 'Error thrown', functionName: 'csvExport in class ExcelExportService', 'arguments': data, 'error': error });
        logger.info({ event: 'Exited function', functionName: 'csvExport' });
        const clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
        return res.status(200).send(this.getResponse(clientResponse));
    }
  }

  async csvExportOutgoing(data, res) {
    logger.debug({ event: 'Entered function', functionName: 'csvExportOutgoing in ExcelExportService'});
    try {

      // workbook code.
      const workbook = new Excel.Workbook();
      const outgoingTransactionWorkSheet = workbook.addWorksheet('sheet1');

      logger.debug({ event: 'Info Message', functionName: 'Creating sheet Upload for Outgoing Transactions'});

      outgoingTransactionWorkSheet.getRow(1).values = [
        'TransactionID Objective',
        'TransactionID Jazz Cash',
        'TransactionID Easypaisa',
        'Transaction Date',
        'Transaction Time',
        'Beneficiary Name',
        "Beneficiary Bank Name",
        "Sender MSISDN",
        "Beneficiary Bank Account",
        "Sender Level",
        "Sender CNIC",
        "Receiver MSISDN",
        "Initiator MSISDN",
        "Initiator City",
        "Sender Name",
        "Initiator Region",
        "Amount",
        "Transaction Status",
        "Reason of Failure",
        "Fee",
        "Fed",
        "Commission",
        "WHT",
        "STAN",
        "Current Balance",
        "Reversal Status",
        "Channel"
      ];

      outgoingTransactionWorkSheet.getRow(1).height = 10;

      outgoingTransactionWorkSheet.columns = [
        { key: 'TransactionID Objective', width: 20 },
        { key: 'TransactionID Jazz Cash', width: 15 },
        { key: 'TransactionID Easypaisa', width: 20 },
        { key: 'Transaction Date', width: 15 },
        { key: 'Transaction Time', width: 15 },
        { key: 'Beneficiary Name', width: 20 },
        { key: 'Beneficiary Bank Name', width: 15 },
        { key: 'Sender MSISDN', width: 15 },
        { key: 'Beneficiary Bank Account', width: 15 },
        { key: 'Sender Level', width: 20 },
        { key: 'Sender CNIC', width: 15 },
        { key: 'Receiver MSISDN', width: 15 },
        { key: 'Initiator MSISDN', width: 15 },
        { key: 'Initiator City', width: 15 },
        { key: 'Sender Name', width: 15 },
        { key: 'Initiator Region', width: 15 },
        { key: 'Amount', width: 15 },
        { key: 'Transaction Status', width: 15 },
        { key: 'Reason of Failure', width: 15 },
        { key: 'Fee', width: 15 },
        { key: 'Fed', width: 20 },
        { key: 'Commission', width: 15 },
        { key: 'WHT', width: 15 },
        { key: 'STAN', width: 15 },
        { key: 'Current Balance', width: 15 },
        { key: 'Reversal Status', width: 15 },
        { key: 'Channel', width: 15 },
      ];

      for (let row in data) {
        outgoingTransactionWorkSheet.addRow({
            "TransactionID Objective": data[row][0],
            "TransactionID Jazz Cash": data[row][1],
            "TransactionID Easypaisa": data[row][2],
            "Transaction Date": data[row][3],
            "Transaction Time": data[row][4],
            "Beneficiary Name": data[row][5],
            "Beneficiary Bank Name": data[row][6],
            "Sender MSISDN": data[row][7],
            "Beneficiary Bank Account": data[row][8],
            "Sender Level": data[row][9],
            "Sender CNIC": data[row][10],
            "Receiver MSISDN": data[row][11],
            "Initiator MSISDN": data[row][12],
            "Initiator City": data[row][13],
            "Sender Name": data[row][14],
            "Initiator Region": data[row][15],
            "Amount": data[row][16],
            "Transaction Status": data[row][17],
            "Reason of Failure": data[row][18],
            "Fee": data[row][19],
            "Fed": data[row][20],
            "Commission": data[row][21],
            "WHT": data[row][22],
            "STAN": data[row][23],
            "Current Balance": data[row][24],
            "Reversal Status": data[row][25],
            "Channel": data[row][26]
        });
      }

      const now = new Date();
      const dateTimestamp = now
        .toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '')
        .replace(/:/g, '.');
      const fileName = `IBFT Outgoing Transaction-${dateTimestamp}-csvexport.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
      await workbook.csv.write(res);
      res.status(200).end();
    } catch (error) {
        console.log(error);
        logger.error({ event: 'Error thrown', functionName: 'csvExport in class ExcelExportService', 'arguments': data, 'error': error });
        logger.info({ event: 'Exited function', functionName: 'csvExport' });
        const clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
        return res.status(200).send(this.getResponse(clientResponse));
    }
  }

  getResponse(responsePayload) {
    console.log('_______________ Get Response Called ________________');
    console.log(responsePayload);

    try {
      let updatedResponse = {};
    
      if (responsePayload.success) {
        updatedResponse = _.omit(responsePayload, ['message_ur', 'responseCode']);
      } else {
        updatedResponse = _.omit(responsePayload, [ 'message_ur', 'data', 'responseCode']);
      }
      return updatedResponse;

    } catch(error) {
      console.log(error);
      return {
        "success": false,
        "message_en": "System internal server error"
      }
    }
  }

}
export default new ExcelExportService();
