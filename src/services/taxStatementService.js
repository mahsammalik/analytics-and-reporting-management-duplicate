import DB2Connection from '../util/DB2Connection';
import { open } from 'ibm_db';
const connectionString = config.DB2_Jazz.connectionString
import {
    createPDF,
    logger,
    taxStatementTemplate,
    taxStatementConsumerTemplate
} from '../util/';
import Notification from '../util/notification';
import accountStatementEmailTemplate from '../util/accountStatementEmailTemplate';
import moment from 'moment';
import MsisdnTransformer from '../util/msisdnTransformer';

/**
 * Returns formated number like 1st, 2nd, 3rd, 4th
 * @param {*} day 
 * @returns 
 */
 const nth = day => {
	if(day > 3 && day < 21)
	{
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

class taxStatementService {
    constructor() {
        this.sendTaxStatement = this.sendTaxStatement.bind(this);
        this.populateDataBase = this.populateDataBase.bind(this);
    }


    async sendTaxStatement(payload, res) {
        try {
            const isConsumer = payload.channel.includes("consumer");
            logger.info({
                event: 'Entered Function',
                functionName: 'taxStatementService.sendTaxStatement',
                data: { isConsumer, payload }
            });
            let data = [];
            let consumerTaxData = [];
            if(isConsumer){
                data = await DB2Connection.getTaxCertificateData(payload.msisdn, payload.year) || [];
                if(data.length < 1){
                    return "No Data"
                }
                consumerTaxData = data[0];
                logger.info({
                    event: 'Tax Certificate Data for Consumer',
                    consumerTaxData
                })
            }else{
                let mappedMSISDN = await MsisdnTransformer.formatNumberSingle(payload.msisdn, payload.msisdn.startsWith('03') ? 'international' : 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
                data = await DB2Connection.getTaxValueArray(payload.msisdn, mappedMSISDN,  payload.end_date, payload.start_date);
                const updatedRunningbalance = await DB2Connection.getLatestAccountBalanceValue(payload.msisdn, mappedMSISDN, payload.end_date);
                logger.info(`Step 02: Obtained running balance ${updatedRunningbalance}`)
                logger.debug(`Array Format statement ${JSON.stringify(data)}`, updatedRunningbalance, "updatedRunningbalance ");
                payload['updatedRunningbalance'] = updatedRunningbalance || 0.00;
            }
            logger.info({
                event: 'Response from DB2',
                data
            });
            if (data === 'Database Error') return "Database Error";
            const accountData = {
                headers: ['MSISDN', 'Trx ID', 'Trx DateTime', 'Total Tax Deducted', 'Sales Tax', 'Income Tax', 'Withholding Tax', 'Fee', 'Commission'],
                data: isConsumer ? consumerTaxData : data,
                payload
            };
            const htmlTemplate = isConsumer ? taxStatementConsumerTemplate(accountData) : taxStatementTemplate(accountData);
            let pdfFile = await createPDF({
                template: htmlTemplate,
                fileName: `TaxStatement.pdf`
            });
            logger.info(`Step 03: Obtained htmlTemplate for tax`)
            pdfFile = Buffer.from(pdfFile, 'base64').toString('base64');
            const emailData = [{
                'key': 'customerName',
                'value': isConsumer ? consumerTaxData[0] : payload.merchantName
            },
            {
                'key': 'accountNumber',
                'value': payload.msisdn
            },
            {
                'key': 'statementPeriod',
                'value': isConsumer ? payload.year : payload.start_date
            }
            ];
            const attachment = [{
                filename: 'TaxCertificate.pdf',
                content: pdfFile,
                type: 'base64',
                embedImage: false
            }];
            logger.debug("FINAL RESPONSE OF THE OUTPUT ", attachment, emailData);
            if (payload.email) {
                logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });
                const attachment = [{
                    filename: 'TaxStatement.pdf',
                    content: pdfFile,
                    type: 'base64',
                    embedImage: false
                }];
                let emailHTMLContent = await accountStatementEmailTemplate({
                    title: 'Tax Certificate',
                    customerName: isConsumer ? consumerTaxData[0] : payload.merchantName,
                    accountNumber: payload.msisdn,
                    statementPeriod: isConsumer ? consumerTaxData[3] : `${(payload.start_date ? formatEnglishDate(payload.start_date) : '-') + ' to ' + (payload.end_date ? formatEnglishDate(payload.end_date) : '-')}`,
                    accountLevel: isConsumer ? consumerTaxData[2] : payload.accountLevel,
                    channel: payload.channel
                }) || '';

                logger.info({
                    event: 'Email HTML Content',
                    emailHTMLContent
                })

                emailData.push({
                    key: "htmlTemplate",
                    value: emailHTMLContent,
                });
                const emailSubject = `Tax Certificate for <${payload.msisdn}>, ${consumerTaxData[3]}`;
                emailData.push({
                    key: "subject",
                    value: isConsumer ? emailSubject: 'TAX STATEMENT',
                });

                // return await new Notification.sendEmail(payload.email, 'Tax Certificate', '', attachment, 'TAX_STATEMENT', emailData);
                return await new Notification.sendEmailKafka(payload.email, 'Tax Certificate', '', attachment, 'TAX_STATEMENT', emailData);
                logger.info(`Step 04: Sent email `)
            }
            else {
                throw new Error(`Email Not provided`);
                logger.error(`Email not provided`)
            }
        } catch (err) {
            logger.error({ event: 'Error in pdf Creation' + err });
            logger.error(err)
            return "PDF creation error";
        }
    }



    async sendTaxStatementNew(payload, res) {
        logger.debug("email pdf", payload);
        try {
            let mappedMSISDN = await MsisdnTransformer.formatNumberSingle(payload.msisdn, payload.msisdn.startsWith('03') ? 'international' : 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
            const data = await DB2Connection.getTaxValueArray(payload.msisdn, mappedMSISDN,  payload.end_date, payload.start_date);
            logger.debug("the output of changing database " + data);
            if (data === 'Database Error') return "Database Error";

            const updatedRunningbalance = await DB2Connection.getLatestAccountBalanceValue(payload.msisdn, mappedMSISDN, payload.end_date);

            logger.info(`Step 02: Obtained running balance ${updatedRunningbalance}`)

            logger.debug(`Array Format statement ${JSON.stringify(data)}`, updatedRunningbalance, "updatedRunningbalance ");

            payload['updatedRunningbalance'] = updatedRunningbalance || 0.00;
            const accountData = {
                headers: ['MSISDN', 'Trx ID', 'Trx DateTime', 'Total Tax Deducted', 'Sales Tax', 'Income Tax', 'Withholding Tax', 'Fee', 'Commission'],
                data,
                payload
            };
            const htmlTemplate = taxStatementTemplate(accountData);
            let pdfFile = await createPDF({
                template: htmlTemplate,
                fileName: `Tax Statement`
            });
            logger.info(`Step 03: Obtained htmlTemplate for tax`)
            pdfFile = Buffer.from(pdfFile, 'base64').toString('base64');
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
                filename: 'Tax Certificate.pdf',
                content: pdfFile,
                type: 'base64',
                embedImage: false
            }];
            logger.debug("FINAL RESPONSE OF THE OUTPUT ", attachment, emailData);
            if (payload.email) {
                logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });
                const attachment = [{
                    filename: 'TaxStatement.pdf',
                    content: pdfFile,
                    type: 'base64',
                    embedImage: false
                }];
                let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Tax Statement', customerName: payload.merchantName, accountNumber: payload.msisdn, statementPeriod: `${(payload.start_date ? formatEnglishDate(payload.start_date) : '-') + ' to ' + (payload.end_date ? formatEnglishDate(payload.end_date) : '-')}`, accountLevel: payload.accountLevel }) || '';

                emailData.push({
                    key: "htmlTemplate",
                    value: emailHTMLContent,
                });

                // return await new Notification.sendEmail(payload.email, 'Tax Certificate', '', attachment, 'TAX_STATEMENT', emailData);
                return await new Notification.sendEmailKafka(payload.email, 'Tax Certificate', '', attachment, 'TAX_STATEMENT', emailData);
                logger.info(`Step 04: Sent email `)
            }
            else {
                throw new Error(`Email Not provided`);
                logger.error(`Email not provided`)
            }

            // myDoc.table(table0, {
            //     prepareHeader: () => myDoc.font('Helvetica-Bold').fontSize(5),
            //     prepareRow: (row, i) => myDoc.font('Helvetica').fontSize(5)
            // });
            // myDoc.end();
        } catch (err) {
            logger.error({ event: 'Error in pdf Creation' + err });
            logger.error(err)
            return "PDF creation error";
        }
    }

    async populateDataBase() {
        await DB2Connection.addTaxStatement('0343015091633', '2020-08-26', '851626', '0', '12', '0', '0', '20', '0');
    }
}

export default new taxStatementService();