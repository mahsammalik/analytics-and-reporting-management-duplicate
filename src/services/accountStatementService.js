import { isString } from 'lodash';
import {
    logger,
    createPDF,
    accountStatementTemplate,
    accountStatementTemplateMerchant,
    Notification,
} from '/util/';
import AccountStatementRequest from '../model/acntStmtRequest';
import DB2Connection from '../util/DB2Connection';
import accountStatementEmailTemplate from '../util/accountStatementEmailTemplate';
import moment from 'moment';
import { getMappedAccountStatement, getMappedAccountStatementMerchant } from '../util/accountStatementMapping';
import { printLog } from '../util/utility';
const oracleAccountManagementURL = process.env.ORACLE_ACCOUNT_MANAGEMENT_URL || config.externalServices.oracleAccountManagement.oracleAccountManagementURL;

/**
 * Returns formated number like 1st, 2nd, 3rd, 4th
 * @param {*} day 
 * @returns 
 */
const nth = day => {
    if (day > 3 && day < 21) {
        return day + "th";
    }

    switch (day % 10) {
        case 1:
            return day + "st";
        case 2:
            return day + "nd";
        case 3:
            return day + "rd";
        default:
            return day + "th";
    }
}

/**
 * format date like 15th August, 2021
 * @param {*} date 
 */
const formatEnglishDate = date => {
    return nth(moment(date).format("DD")) + " " + moment(date).format("MMMM") + ", " + moment(date).format("YYYY");
}

class accountStatementService {
    constructor(AccountStatementRequest) {
        this.AccountStatementRequest = AccountStatementRequest
    }

    async createAccountStatementRequest(payload) {
        try {
            logger.info({
                event: 'Entered function',
                functionName: 'accountStatementService.createAccountStatementRequest',
                data: payload
            });
            let requestCreated = await AccountStatementRequest.create(payload);
            return !!requestCreated ? { success: true } : { success: false }
        } catch (error) {
            logger.info({
                event: 'Catch function',
                functionName: 'accountStatementService.createAccountStatementRequest',
                error
            });
            return { success: false };
        }
    }

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

                let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Account Statement', customerName: payload.merchantName, accountNumber: msisdn, statementPeriod: `${(payload.start_date ? formatEnglishDate(payload.start_date) : '-') + ' to ' + (payload.end_date ? formatEnglishDate(payload.end_date) : '-')}`, accountLevel: payload.accountLevel, channel: payload.channel }) || '';

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
    async sendEmailCSVFormatMerchant(payload) {
        try {

            printLog(
                'Entered function',
                'accountStatementService.sendEmailCSVFormatMerchant',
                { payload: payload }
            );

            const {
                msisdn = " ",
                end_date = "",
                start_date = "",
                merchantName = "",
                email = "",
                accountLevel = "",
                channel = "",
            } = payload;

            if (msisdn.substring(0, 2) === "92") msisdn = msisdn.replace("92", "0");

            // * FETCH ACCOUNT STATEMENT
            const db2Data = await DB2Connection.getValue(msisdn, end_date, start_date);

            logger.debug("CHECK DB2 Account Statement CSV: ", db2Data);

            let header = [
                "Transaction ID, Transaction Date, Transaction Type, Channel, Description, Amount debited, Amount credited, Fee, Running balance, Reason Type\n",
            ];

            header = header.join(",");
            const csvData = new Buffer.from(header + db2Data).toString("base64");
            logger.debug(`csvData ${csvData}`, db2Data);

            // * CREATE A EMAIL CONTENT
            const emailData = [
                {
                    key: "customerName",
                    value: merchantName,
                },
                {
                    key: "accountNumber",
                    value: msisdn,
                },
                {
                    key: "statementPeriod",
                    value: start_date,
                },
            ];

            if (email) {
                logger.info({
                    event: "Exited function",
                    functionName: "sendEmailCSVFormat",
                });
                const attachment = [
                    {
                        filename: "AccountStatement.csv",
                        content: csvData,
                        type: "base64",
                        embedImage: false,
                    },
                ];

                // * CREATE A EMAIL TEMPLATE
                let emailHTMLContent =
                    (await accountStatementEmailTemplate({
                        title: "Account Statement",
                        customerName: merchantName,
                        accountNumber: msisdn,
                        statementPeriod: `${(start_date ? formatEnglishDate(start_date) : "-") +
                            " to " +
                            (end_date ? formatEnglishDate(end_date) : "-")
                            }`,
                        accountLevel: accountLevel,
                        channel: channel,
                    })) || "";

                emailData.push({
                    key: "htmlTemplate",
                    value: emailHTMLContent,
                });

                // * SEND EMAIL TO USER WITH ATTACHMENT
                return await new Notification.sendEmail(
                    email,
                    "Account Statement",
                    "",
                    attachment,
                    "ACCOUNT_STATEMENT",
                    emailData
                );
            } else {
                throw new Error(`Email Not provided`); // ! NO EMAIL FOUND PROVIDED IN THE QUERY PARAM
            }
        } catch (error) {
            logger.error(error);
            return new Error(`Error mailing csv:${error}`);
        }

    }
    async sendEmailPDFFormat(payload) {

        try {
            logger.info({
                event: 'Entered function',
                functionName: 'sendEmailPDFFormat',
                data: payload
            });
            let msisdn = payload.msisdn;
            if (msisdn.substring(0, 2) === '92')
                msisdn = msisdn.replace("92", "0");
            let db2Data = await DB2Connection.getValueArray(payload.msisdn, payload.end_date, payload.start_date);
            if (db2Data.length > 0) {
                db2Data = db2Data.map(arr => {
                    return getMappedAccountStatement(arr);
                }).sort(function (a, b) {
                    var dateA = new Date(a[0]), dateB = new Date(b[0]);
                    return dateA - dateB;
                })
            }

            const accountData = {
                headers: ["Date/Time", "Transaction ID#", "Transaction Type", "Channel", "Transaction Description", "Amount Debit", "Amount Credit", "Running Balance\n"],
                data: db2Data,
                payload: { ...payload, msisdn }
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

            logger.info({ data: payload })

            if (payload.email) {
                logger.info({
                    event: "Sending payload to accountStatementEmailTemplate",
                    function: "Inside payload.email If block. accountStatementService",
                    payload
                })
                let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Account Statement', customerName: payload.merchantName, accountNumber: msisdn, statementPeriod: `${(payload.start_date ? formatEnglishDate(payload.start_date) : '-') + ' to ' + (payload.end_date ? formatEnglishDate(payload.end_date) : '-')}`, accountLevel: payload.accountLevel, channel: payload.channel }) || '';

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

    async sendEmailPDFMerchant(payload) {

        try {

            printLog(
                'Entered function',
                'accountStatementService.sendEmailPDFMerchant',
                { payload: payload }
            );

            let msisdn = payload.msisdn;

            if (msisdn.substring(0, 2) === '92')
                msisdn = msisdn.replace("92", "0");

            let db2Data = await DB2Connection.getValueArrayMerchant(payload.msisdn, payload.end_date, payload.start_date);

            if (db2Data.length > 0) {
                db2Data = db2Data.map(arr => {
                    return getMappedAccountStatementMerchant(arr);
                }).sort(function (a, b) {
                    var dateA = new Date(a[0]), dateB = new Date(b[0]);
                    return dateA - dateB;
                })
            }

            const accountData = {
                headers: ["Date", "Transaction ID", "Transaction Type", "Channel", "Description", "Amount Debited", "Amount Credited", "Running Balance", "Fee", , "Reason Type\n"],
                data: db2Data,
                payload: { ...payload, msisdn }
            };

            let pdfFile = await createPDF({
                template: accountStatementTemplateMerchant(accountData),
                fileName: `Account Statement`
            });

            pdfFile = Buffer.from(pdfFile, 'base64').toString('base64');

            logger.debug(`pdfFile ${pdfFile}`, db2Data);

            const emailData = [
                {
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

                let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Account Statement', customerName: payload.merchantName, accountNumber: msisdn, statementPeriod: `${(payload.start_date ? formatEnglishDate(payload.start_date) : '-') + ' to ' + (payload.end_date ? formatEnglishDate(payload.end_date) : '-')}`, accountLevel: payload.accountLevel, channel: payload.channel }) || '';

                emailData.push({
                    key: "htmlTemplate",
                    value: emailHTMLContent,
                });

                logger.info({ event: 'Exited function', functionName: 'sendEmailPDFMerchant' });

                const attachment = [{
                    filename: 'AccountStatement.pdf',
                    content: pdfFile,
                    type: 'base64',
                    embedImage: false
                }];

                return await new Notification.sendEmail(payload.email, 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);
            }
            else {
                throw new Error(`Error fetching data for account statement`);
            }

        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'sendEmailPDFMerchant', error, payload });
            logger.info({ event: 'Exited function', functionName: 'sendEmailPDFMerchant' });

            throw new Error(`Error fetching data for account statement:${error}`);
        }

    }
}

export default new accountStatementService(AccountStatementRequest);