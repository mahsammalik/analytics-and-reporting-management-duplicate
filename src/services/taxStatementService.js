const PDFDocument = require('../util/PDFDocumentWithTables');
const {
    Base64Encode
} = require('base64-stream');

var base64 = require('file-base64');
const CSV = require('csv-string');
const fs = require('fs');
import DB2_Connection from '../util/DB2Connection';
import {
    createPDF,
    taxStatementTemplate
} from '../util/';
import Notification from '../util/notification';

class taxStatementService {
    constructor() {
        this.sendTaxStatement = this.sendTaxStatement.bind(this);
        this.populateDataBase = this.populateDataBase.bind(this);
    }


    async sendTaxStatement(payload, res) {
        console.log("email pdf");
        const data = await DB2_Connection.getTaxValueArray(payload.msisdn, payload.end_date, payload.start_date);
        console.log("the output of changing database" + data);
        if (data === 'Database Error') return "Database Error";

        try {

            console.log(`Array Format statement ${JSON.stringify(data)}`);
            const accountData = {
                headers: ['Trx ID', 'Trx DateTime', 'MSISDN', 'Total Tax Deducted', 'Sales Tax', 'Income Tax', 'Withholding Tax', 'Fee', 'Commission'],
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
                    'value': payload.email
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

            const email = await new Notification.sendEmail(`jazzcash.test.user@gmail.com`, 'Tax Certificate', '', attachment, 'TAX_STATEMENT', emailData);
            return email ? true : false;
            // myDoc.table(table0, {
            //     prepareHeader: () => myDoc.font('Helvetica-Bold').fontSize(5),
            //     prepareRow: (row, i) => myDoc.font('Helvetica').fontSize(5)
            // });
            // myDoc.end();
        } catch (err) {
            logger.error('Error in pdf Creation' + err);
            return "PDF creation error";
        }
    }

    async populateDataBase() {
        await DB2_Connection.addTaxStatement('0343015091633', '2020-08-26', '851626', '0', '12', '0', '0', '20', '0');
    }
}

export default new taxStatementService();