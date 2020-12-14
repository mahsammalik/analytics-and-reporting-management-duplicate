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

    async sendEmailCSVFormat(payload) {
        try {

            console.log('-----payload sendEmailCSVFormat---', payload);
            let msisdn = payload.msisdn;
            if (msisdn.substring(0, 2) === '92')
                msisdn = msisdn.replace("92", "0");
            // const data = await DB2Connection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);
            // const data = await OracleDBConnection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date, true);
            const resp = await axios.get(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}&isStringify=true`)
            if (resp.status === 200) {
                const response = resp.data;
                console.log(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}&isStringify=true`, "Oracle db CSV response", response)
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
                    return await new Notification.sendEmail('ehsan.ellahi@ibm.com', 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);
                }
                else {
                    return new Error(`Error mailing csv:${message}`);
                }
            }
            else {
                return new Error(`Error mailing csv`);
            }
        } catch (error) {
            logger.error(error);
            return new Error(`Error mailing csv:${error}`);
        }


    }

    async sendEmailPDFFormat(payload) {

        try {

            console.log('-----payload sendEmailPDFFormat---', payload);
            logger.info({ event: 'Entered function', functionName: 'sendEmailPDFFormat' });
            let msisdn = payload.msisdn;
            if (msisdn.substring(0, 2) === '92')
                msisdn = msisdn.replace("92", "0");
            // const data = await DB2Connection.getValueArray(payload.msisdn, payload.end_date, payload.start_date);
            // const data = await OracleDBConnection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);
            const resp = await axios.get(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}`)
            if (resp.status === 200) {
                const response = resp.data;
                console.log(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}`, "Oracle db Pdf response", response)
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

                    return await new Notification.sendEmail('ehsan.ellahi@ibm.com', 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);
                }
                else {
                    throw new Error(`Error fetching data for account statement:${message}`);
                }
            }
            else {
                throw new Error(`Error fetching data for account statement`);
            }

        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'sendEmailPDFFormat', error, payload });
            logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });

            throw new Error(`Error fetching data for account statement:${error}`);
        }
    }

}

export default accountStatementService;