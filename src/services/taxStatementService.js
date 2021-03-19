import DB2Connection from '../util/DB2Connection';
import {
    createPDF,
    taxStatementTemplate
} from '../util/';
import Notification from '../util/notification';
import accountStatementEmailTemplate from '../util/accountStatementEmailTemplate';

class taxStatementService {
    constructor() {
        this.sendTaxStatement = this.sendTaxStatement.bind(this);
        this.populateDataBase = this.populateDataBase.bind(this);
    }

    async sendTaxStatement(payload, res) {
        console.log("email pdf", payload);
        try {
            const data = await DB2Connection.getTaxValueArray(payload.msisdn, payload.end_date, payload.start_date);
            console.log("the output of changing database " + data);
            if (data === 'Database Error') return "Database Error";

            const updatedRunningbalance = await DB2Connection.getLatestAccountBalanceValue(payload.msisdn, payload.end_date);

            console.log(`Array Format statement ${JSON.stringify(data)}`, updatedRunningbalance, "updatedRunningbalance ");

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
            console.log("FINAL RESPONSE OF THE OUTPUT ", attachment, emailData);
            if (payload.email) {
                logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });
                const attachment = [{
                    filename: 'AccountStatement.pdf',
                    content: pdfFile,
                    type: 'base64',
                    embedImage: false
                }];
                let emailHTMLContent = await accountStatementEmailTemplate({ title: 'Tax Statement', customerName: payload.merchantName, accountNumber: payload.msisdn, statementPeriod: `${payload.start_date || '-' + ' to ' + payload.end_date || '-'}`, accountLevel: payload.accountLevel }) || '';

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