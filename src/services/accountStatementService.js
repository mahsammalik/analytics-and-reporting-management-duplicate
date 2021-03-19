import { isString } from 'lodash';
import {
    logger,
    createPDF,
    accountStatementTemplate,
    Notification,
    OracleDBConnection,
} from '/util/';
import DB2Connection from '../util/DB2Connection';

import axios from 'axios';
import accountStatementEmailTemplate from '../util/accountStatementEmailTemplate';

const oracleAccountManagementURL = process.env.ORACLE_ACCOUNT_MANAGEMENT_URL || config.externalServices.oracleAccountManagement.oracleAccountManagementURL;

class accountStatementService {

    async sendEmailCSVFormat(payload) {
        try {

            console.log('-----payload sendEmailCSVFormat---', payload);
            let msisdn = payload.msisdn;
            if (msisdn.substring(0, 2) === '92')
                msisdn = msisdn.replace("92", "0");
            const db2Data = await DB2Connection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);
            console.log("CHECK DB2 Account Statement CSV: ", db2Data);
            // const data = await OracleDBConnection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date, true);
            const resp = await axios.get(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}&isStringify=true`)
            console.log("******Oracle Account Management Response*****", resp);
            if (resp.status === 200) {
                const response = resp.data;
                console.log("CHECK CsV Oracle Account Statement: ", resp.data);
                console.log(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}&isStringify=true`, "Oracle db CSV response", response)
                const { data, success, message } = response;
                if (success) {
                    let header = ["Transaction ID, Transaction Date, Transaction Type, Channel, Description, Amount debited, Amount credited, Running balance\n"];
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

                    if (payload.email) {
                        logger.info({ event: 'Exited function', functionName: 'sendEmailCSVFormat' });
                        const attachment = [{
                            filename: 'AccountStatement.csv',
                            content: csvData,
                            type: 'base64',
                            embedImage: false
                        }];

                        let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Account Statement', customerName: payload.merchantName, accountNumber: payload.msisdn, statementPeriod: `${payload.start_date || '-' + ' to ' + payload.end_date || '-'}`, accountLevel: payload.accountLevel }) || '';

                        emailData.push({
                            key: "htmlTemplate",
                            value: emailHTMLContent,
                        });
                        return await new Notification.sendEmail(payload.email, 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);
                    }
                    else {
                        throw new Error(`Email Not provided`);
                    }
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
            const db2Data = await DB2Connection.getValueArray(payload.msisdn, payload.end_date, payload.start_date);
            console.log("CHECK DB2 Account Statement: ", db2Data);
            // const data = await OracleDBConnection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);
            const resp = await axios.get(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}`)
            if (resp.status === 200) {
                const response = resp.data;
                console.log("CHECK Oracle Account Statement: ", resp.data)
                console.log(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}`, "Oracle db Pdf response", response)
                const { data, success, message } = response;
                if (success) {
                    const accountData = {
                        headers: ["Transaction ID", "Date", "Transaction Type", "Channel", "Description", "Amount debited", "Amount credited", "Running balance\n"],
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

                    if (payload.email) {

                        let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Account Statement', customerName: payload.merchantName, accountNumber: payload.msisdn, statementPeriod: `${payload.start_date || '-' + ' to ' + payload.end_date || '-'}`, accountLevel: payload.accountLevel }) || '';
                        emailData.push({
                            key: "htmlTemplate",
                            value: emailHTMLContent,
                        });
                        logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });
                        const attachment = [{
                            filename: 'AccountStatement.pdf',
                            content: pdfFile,
                            type: 'base64',
                            embedImage: false
                        }];
                        return await new Notification.sendEmail(payload.email, 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);
                    }
                    else {
                        throw new Error(`Email Not provided`);
                    }
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