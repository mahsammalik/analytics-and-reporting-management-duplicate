import { isString } from 'lodash';
import {
    logger,
    createPDF,
    accountStatementTemplate,
    Notification,
    DB2Connection,
    OracleDBConnection,
} from '/util/';
import axios from 'axios';

const oracleAccountManagementURL = process.env.ORACLE_ACCOUNT_MANAGEMENT_URL || config.externalServices.oracleAccountManagement.oracleAccountManagementURL;

class accountStatementService {

    async sendEmailCSVFormat(payLoad) {
        try {

            // const data = await DB2Connection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);
            // const data = await OracleDBConnection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date, true);
            const response = axios.get(`${oracleAccountManagementURL}?customerMobileNumer=${payLoad.msisdn}&startDate=${payLoad.start_date}&endDate=${payLoad.end_date}&isStringify=true`)
            const { data, success, message } = response;
            if (success) {
                let header = ["Transaction ID, Transaction DateTime, MSISDN, Transaction Type, Channel, Description, Amount debited, Amount credited, Running balance\n"];
                header = header.join(',');
                const csvData = new Buffer.from(header + data).toString('base64');
                console.log(`csvData ${csvData}`, data);

                const emailData = [{
                    'key': 'customerName',
                    'value': payload.merchantName
                },
                {
                    'key': 'accountNumber',
                    'value': payload.msisdn
                },
                {
                    'key': 'statementPeriod',
                    'value': payload.start_date
                }
                ];
                const attachment = [{
                    filename: 'AccountStatement.csv',
                    content: csvData,
                    type: 'base64',
                    embedImage: false
                }];
                return await new Notification.sendEmail('jazzcash.test.user@gmail.com', 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);
            }
            else {
                return new Error(`Error mailing csv:${message}`);
            }
        } catch (error) {
            logger.error(error);
            return new Error(`Error mailing csv:${error}`);
        }


    }

    async sendEmailPDFFormat(payload) {

        try {
            logger.info({ event: 'Entered function', functionName: 'sendEmailPDFFormat' });

            // const data = await DB2Connection.getValueArray(payload.msisdn, payload.end_date, payload.start_date);
            // const data = await OracleDBConnection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);
            const response = axios.get(`${oracleAccountManagementURL}?customerMobileNumer=${payLoad.msisdn}&startDate=${payLoad.start_date}&endDate=${payLoad.end_date}`)
            const { data, success, message } = response;
            if (success) {
                const accountData = {
                    headers: ['Transaction ID', 'Transaction Date', 'Transaction Type', 'Channel', 'Description', 'Amount debited', 'Amount credited', 'Running balance'],
                    data,
                    payload

                };

                let pdfFile = await createPDF({
                    template: accountStatementTemplate(accountData),
                    fileName: `Account Statement`
                });
                pdfFile = Buffer.from(pdfFile, 'base64').toString('base64');

                console.log(`pdfFile ${pdfFile}`, data);
                const emailData = [{
                    'key': 'customerName',
                    'value': payload.merchantName
                },
                {
                    'key': 'accountNumber',
                    'value': payload.msisdn
                },
                {
                    'key': 'statementPeriod',
                    'value': payload.start_date
                }
                ];
                const attachment = [{
                    filename: 'AccountStatement.pdf',
                    content: pdfFile,
                    type: 'base64',
                    embedImage: false
                }];

                logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });

                return await new Notification.sendEmail('jazzcash.test.user@gmail.com', 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);
            }
            else {
                throw new Error(`Error fetching data for account statement:${message}`);
            }

        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'sendEmailPDFFormat', error, payload });
            logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });

            throw new Error(`Error fetching data for account statement:${error}`);
        }
    }

}

export default accountStatementService;