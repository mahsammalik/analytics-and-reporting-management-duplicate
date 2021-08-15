import DB2Connection from '../util/DB2Connection';
import {
    createPDF,
    taxStatementTemplate
} from '../util/';
import Notification from '../util/notification';
import accountStatementEmailTemplate from '../util/accountStatementEmailTemplate';

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
	return nth(date.format("DD")) + " " + date.format("MMMM") + ", " + date.format("YYYY");
}

class taxStatementService {
    constructor() {
        this.sendTaxStatement = this.sendTaxStatement.bind(this);
        this.populateDataBase = this.populateDataBase.bind(this);
    }

    async sendTaxStatement(payload, res) {
        logger.debug("email pdf", payload);
        try {
            const data = await DB2Connection.getTaxValueArray(payload.msisdn, payload.end_date, payload.start_date);
            logger.debug("the output of changing database " + data);
            if (data === 'Database Error') return "Database Error";

            const updatedRunningbalance = await DB2Connection.getLatestAccountBalanceValue(payload.msisdn, payload.end_date);

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
            }
            else {
                throw new Error(`Email Not provided`);
            }

            // myDoc.table(table0, {
            //     prepareHeader: () => myDoc.font('Helvetica-Bold').fontSize(5),
            //     prepareRow: (row, i) => myDoc.font('Helvetica').fontSize(5)
            // });
            // myDoc.end();
        } catch (err) {
            logger.error({ event: 'Error in pdf Creation' + err });
            return "PDF creation error";
        }
    }

    async populateDataBase() {
        await DB2Connection.addTaxStatement('0343015091633', '2020-08-26', '851626', '0', '12', '0', '0', '20', '0');
    }
}

export default new taxStatementService();