import DB2Connection from '../util/DB2Connection';
import logger from '../util/logger';
import dataMapping from './helpers/dataMapping';
import Excel from 'exceljs';

class ExcelExportService {
  constructor() {
    this.jazzcashIncomingExport = this.jazzcashIncomingExport.bind(this);
    this.jazzcashOutgoingExport = this.jazzcashOutgoingExport.bind(this);
  }

  async jazzcashIncomingExport(req, res) {
    console.log('Inside excel export in easyPaisa service');
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

      this.csvExport(getIncomingTransactionObjects, res);
    } catch (error) {
      console.log(error);
    }
  }

  async jazzcashOutgoingExport(req, res) {
    console.log('Inside excel export in easyPaisa service');
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

      return true;

      // const response = dataMapping.getIBFTOutgoingInitDB2Mapping(initBody);
      // console.log(response);

      const response = dataMapping.getIBFTOutgoingConfirmDB2Mapping(
        confirmBody
      );
      console.log(response);

      // const dataMappingResponse = dataMapping.getIBFTOutgoingConfirmDB2Mapping(confirmBody);
      // console.log(dataMappingResponse);

      console.log(response.initTransData);

      const db2response = await DB2Connection.updateOutgoingTransaction(
        response.confirmTransData
      );
      console.log(db2response);

      // const response = await DB2Connection.getIncomingTransaction();
      // const getIncomingTransactionObjects = await DB2Connection.getIncomingTransactions(req.params.startDate, req.params.endDate);
      // console.log(JSON.stringify(getIncomingTransactionObjects));

      // this.csvExport(getIncomingTransactionObjects, res);
    } catch (error) {
      console.log(error);
    }
  }

  // Excel Export
  async csvExport(data, res) {
    try {

      // workbook code.
      const workbook = new Excel.Workbook();
      const incomingTransactionWorkSheet = workbook.addWorksheet('sheet1');

      logger.debug({ event: 'Info Message', functionName: 'Creating sheet Upload for Incoming Transactions'});

      incomingTransactionWorkSheet.getRow(1).values = [
        'TransactionID Easypaisa',
        'TransactionID Jazz Cash',
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
      ];

      incomingTransactionWorkSheet.getRow(1).height = 10;

      incomingTransactionWorkSheet.columns = [
        { key: 'TransactionID Easypaisa', width: 20 },
        { key: 'TransactionID Jazz Cash', width: 15 },
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
      ];

      for (let row in data) {
        incomingTransactionWorkSheet.addRow({
          'TransactionID Easypaisa': data[row][0],
          'TransactionID Jazz Cash': data[row][1],
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
        // res.status(200).json({

        // })
    }
  }
}
export default new ExcelExportService();
