import DB2Connection from '../util/DB2Connection';
import { open } from 'ibm_db';
const connectionString = config.DB2_Jazz.connectionString
import {
    createPDF,
    logger,
    taxStatementTemplate
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


    async sendTaxStatementNew(payload, res) {
        logger.debug("email pdf", payload);
        try {
            
            let mappedMSISDN = await MsisdnTransformer.formatNumberSingle(payload.msisdn, payload.msisdn.startsWith('03') ? 'international' : 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
            logger.info(`Step 02 b: mappedMSISDN: `, mappedMSISDN);

            let conn = await open(connectionString);
            const data = await DB2Connection.getTaxValueArrayWithConn(payload.msisdn, mappedMSISDN, payload.end_date, payload.start_date,conn);
            logger.debug("the output of changing database " + data);
            if (data === 'Database Error') return "Database Error";
            logger.info(`Step 01: Obtained Tax Values array`)

            const updatedRunningbalance = await DB2Connection.getLatestAccountBalanceValueWithConn(payload.msisdn, mappedMSISDN, payload.end_date,conn);

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

                return await new Notification.sendEmail(payload.email, 'Tax Certificate', '', attachment, 'TAX_STATEMENT', emailData);
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
        }finally {
            logger.info('Executing finally ');
            conn.close(function (err) { if (err) { logger.error(err) } });
        }
        
    }



    async sendTaxStatement(payload, res) {
        logger.debug("email pdf", payload);
        try {
            const data = await DB2Connection.getTaxValueArray(payload.msisdn, payload.end_date, payload.start_date);
            logger.debug("the output of changing database " + data);
            if (data === 'Database Error') return "Database Error";
            logger.info(`Step 01: Obtained Tax Values array`)

            const updatedRunningbalance = await DB2Connection.getLatestAccountBalanceValue(payload.msisdn, payload.end_date);

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

                return await new Notification.sendEmail(payload.email, 'Tax Certificate', '', attachment, 'TAX_STATEMENT', emailData);
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