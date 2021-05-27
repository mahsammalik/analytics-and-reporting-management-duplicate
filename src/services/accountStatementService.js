import { isString } from 'lodash';
import {
    logger,
    createPDF,
    accountStatementTemplate,
    Notification,
} from '/util/';
import DB2Connection from '../util/DB2Connection';
import accountStatementEmailTemplate from '../util/accountStatementEmailTemplate';
import moment from 'moment';

const oracleAccountManagementURL = process.env.ORACLE_ACCOUNT_MANAGEMENT_URL || config.externalServices.oracleAccountManagement.oracleAccountManagementURL;

class accountStatementService {

    async sendEmailCSVFormat(payload) {
        try {

            logger.debug('-----payload sendEmailCSVFormat---', payload);
            let msisdn = payload.msisdn;
            if (msisdn.substring(0, 2) === '92')
                msisdn = msisdn.replace("92", "0");
            const db2Data = await DB2Connection.getValue(payload.msisdn, payload.end_date, payload.start_date);
            logger.debug("CHECK DB2 Account Statement CSV: ", db2Data);
            // const data = await OracleDBConnection.getValue(payload.msisdn, payload.end_date, payload.start_date, true);
            // const resp = await axios.get(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}&isStringify=true`)
            // if (resp.status === 200) {
            // const response = db2Data;
            // logger.debug("CHECK CsV Oracle Account Statement: ", resp.data);
            // logger.debug(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}&isStringify=true`, "Oracle db CSV response", response)
            // const { data, success, message } = response;
            // if (success) {
            let header = ["Transaction ID, Transaction Date, Transaction Type, Channel, Description, Amount debited, Amount credited, Running balance\n"];
            header = header.join(',');
            const csvData = new Buffer.from(header + db2Data).toString('base64');
            logger.debug(`csvData ${csvData}`, db2Data);

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

                let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Account Statement', customerName: payload.merchantName, accountNumber: msisdn, statementPeriod: `${(moment(payload.start_date).format('DD MMM YYYY') || '-') + ' to ' + (moment(payload.end_date).format('DD MMM YYYY') || '-')}`, accountLevel: payload.accountLevel, channel: payload.channel }) || '';

                emailData.push({
                    key: "htmlTemplate",
                    value: emailHTMLContent,
                });
                return await new Notification.sendEmail(payload.email, 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);
            }
            else {
                throw new Error(`Email Not provided`);
            }
            // }
            // else {
            //     return new Error(`Error mailing csv`);
            // }
            // }
            // else {
            //     return new Error(`Error mailing csv`);
            // }
        } catch (error) {
            logger.error(error);
            return new Error(`Error mailing csv:${error}`);
        }


    }

    async sendEmailPDFFormat(payload) {

        try {

            logger.debug('-----payload sendEmailPDFFormat---', payload);
            logger.info({ event: 'Entered function', functionName: 'sendEmailPDFFormat' });
            let msisdn = payload.msisdn;
            if (msisdn.substring(0, 2) === '92')
                msisdn = msisdn.replace("92", "0");
            let db2Data = await DB2Connection.getValueArray(payload.msisdn, payload.end_date, payload.start_date);
            // const data = await OracleDBConnection.getValue(payload.msisdn, payload.end_date, payload.start_date);
            // const resp = await axios.get(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}`)
            // if (resp.status === 200) {
            //     const response = resp.data;
            //     logger.debug("CHECK Oracle Account Statement: ", resp.data)
            //     logger.debug(`${oracleAccountManagementURL}?customerMobileNumber=${msisdn}&startDate=${payload.start_date}&endDate=${payload.end_date}`, "Oracle db Pdf response", response)
            //     const { data, success, message } = response;
            // if (success) {
            if (db2Data.length > 0)
                db2Data = db2Data.map((dat) => {
                    dat.splice(0, 1);
                    let b = dat[1];
                    dat[1] = dat[0];
                    dat[0] = b;
                    return dat
                })
            const accountData = {
                headers: ["Transaction ID", "Date", "Transaction Type", "Channel", "Description", "Amount debited", "Amount credited", "Running balance\n"],
                data: db2Data.sort(function (a, b) {
                    var dateA = new Date(a[1]), dateB = new Date(b[1]);
                    return dateA - dateB;
                }),
                payload
            };

            let pdfFile = await createPDF({
                template: accountStatementTemplate(accountData),
                fileName: `Account Statement`
            });
            pdfFile = Buffer.from(pdfFile, 'base64').toString('base64');

            logger.debug(`pdfFile ${pdfFile}`, db2Data);
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

                let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Account Statement', customerName: payload.merchantName, accountNumber: msisdn, statementPeriod: `${(moment(payload.start_date).format('DD MMM YYYY') || '-') + ' to ' + (moment(payload.end_date).format('DD MMM YYYY') || '-')}`, accountLevel: payload.accountLevel, channel: payload.channel }) || '';

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
                //     }
                //     else {
                //         throw new Error(`Email Not provided`);
                //     }
                // }
                // else {
                //     throw new Error(`Error fetching data for account statement:${message}`);
                // }
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