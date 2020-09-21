import DB2_Connection from '../util/DB2Connection';
const fs = require('fs');
const HummusRecipe = require('hummus-recipe');
import {
    createPDF,
    accountStatementTemplate
} from '../util/';
import Notification from '../util/notification';


class accountStatementService {
    constructor() {
        this.test = this.test.bind(this);
    }


    async testPackage() {
        const pdfDoc = new HummusRecipe(imageDIR + 'test.pdf', imageDIR + 'output.pdf', {
            version: 1.6,
            author: 'John Doe',
            title: 'Hummus Recipe',
            subject: 'A brand new PDF'
        });

        pdfDoc
            .editPage(1)
            .text('Add some texts to an existing pdf file', 150, 300)
            .endPage()
            .endPDF();
    }

    async test_purpose(payload, accountSatatemet) {

        let headerInfo = {
            date: accountSatatemet.date,
            accNum: accountSatatemet.msisdn,
            accTitle: "Nishat Linen",
            period: payload.start_date + " _ " + end_date,
            accType: accountSatatemet.transactionType,
        };
        let summary = {
            obalance: numeral(1900.00).format('0,0.00'),
            cramount: numeral(11110.92).format('0,0.00'),
            crtrx: numeral(12).format('0,0'),
            avgcrtrx: numeral(925.91).format('0,0.00'),
            dbamount: numeral(-9900.92).format('0,0.00'),
            dbtrx: numeral(99).format('0,0'),
            avgdbtrx: numeral(100.00).format('0,0.00'),
            cbalance: numeral(90.91).format('0,0.00'),
        };
        let customers = [];
        for (let index = 0; index < 55; index++) {
            customers.push({
                msisdn: accountSatatemet.msisdn,
                date: accountSatatemet.Date,
                trxid: accountSatatemet.trxId,
                trxtype: accountSatatemet.trxType,
                channel: accountSatatemet.channel,
                description: accountSatatemet.description,
                debit: accountSatatemet.debit,
                credit: accountSatatemet.credit,
                balance: accountSatatemet.balance
            });
        }
    }


    async sendEmailCSV_Format(payLoad) {
        try {

            const data = await DB2_Connection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);

            let header = ["Transaction ID, Transaction DateTime, MSISDN, Transaction Type, Channel, Description, Amount debited, Amount credited, Running balance\n"];
            header = header.join(',');
            const csvData = new Buffer.from(header + data).toString('base64');
            // console.log(`csvData ${csvData}`);

            const emailData = [{
                    'key': 'customerName',
                    'value': `Nishat Linen`
                },
                {
                    'key': 'accountNumber',
                    'value': `03015091633`
                },
                {
                    'key': 'statementPeriod',
                    'value': `20-03-2020`
                }
            ];
            const attachment = [{
                filename: 'AccountStatement.csv',
                content: csvData,
                type: 'base64',
                embedImage: false
            }];
            return await new Notification.sendEmail('jazzcash.test.user@gmail.com', 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);

            // let output = [];
            // console.log(`pdf path ${pdfPath}`);

            // const parser = parse({
            //     delimiter: "\n",
            //     separator: "\n"
            // }).pipe(fs.createWriteStream(`${pdfPath}test.csv`));
            // // Use the readable stream api
            // parser.on('readable', () => {
            //     let record;
            //     while (record = parser.read()) {
            //         output.push(record);
            //     }
            // });
            // // Catch any error
            // parser.on('error', (err) => {
            //     console.error(err.message);
            // });
            // // When we are done, test that the parsed output matched what expected
            // const response = await parser.on('end', async function() {
            //     let buff = new Buffer.from(output);
            //     let base64data = buff.toString('base64');


            // });
            // // Write data to the stream
            // parser.write("Trx ID, Trx DateTime, MSISDN, Transaction Type, Channel, Description, Amount debited, Amount credited, Running balance\n");
            // parser.write(data);
            // // Close the readable stream
            // parser.end();
            // console.info(response.bufferedRequest.chunk);
            // let buff = new Buffer.from(response.bufferedRequest.chunk);
            // let base64data = buff.toString('base64');
            // console.log(base64data);


            // generate(data)
            //   .pipe(fs.createWriteStream(imageDIR + 'test.csv'))
        } catch (error) {
            logger.error(error);
            return new Error(`Error mailing csv:${error}`);
        }


    }
    generateHeader(doc) {
        doc
            .image(pdfDIR + "jazzcash.png", 50, 45, {
                width: 50
            })
            .fillColor("red")
            .fontSize(15);

        doc.text("Statement OF Account", 110, 70, {
                align: "left"
            })
            .fillColor("#444444")
            .fontSize(10)
            .moveDown();

        doc.text("from", 110, 90, {
                align: "left"
            })
            .fontSize(10)
            .text("to")
            .fontSize(10)
            .text("123 Main Street", 200, 65, {
                align: "right"
            })
            .text("New York, NY, 10025", 200, 80, {
                align: "right"
            })
            .moveDown();
    }

    async sendEmailPDF_Format(payload, res) {
        console.log("email pdf");


        try {
            const data = await DB2_Connection.getValueArray(payload.msisdn, payload.end_date, payload.start_date);
            // console.log(`the output of changing database ${JSON.stringify(data)}`);
            if (data === 'Database Error') return "Database Error";


            // console.log(`Array Format statement ${JSON.stringify(data)}`);
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
            const emailData = [{
                    'key': 'customerName',
                    'value': `Nishat Linen`
                },
                {
                    'key': 'accountNumber',
                    'value': `03015091633`
                },
                {
                    'key': 'statementPeriod',
                    'value': `20-03-2020`
                }
            ];
            const attachment = [{
                filename: 'AccountStatement.pdf',
                content: pdfFile,
                type: 'base64',
                embedImage: false
            }];

            return await new Notification.sendEmail('jazzcash.test.user@gmail.com', 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);

            // myDoc.table(table0, {
            //     prepareHeader: () => myDoc.font('Helvetica-Bold').fontSize(5),
            //     prepareRow: (row, i) => myDoc.font('Helvetica').fontSize(5)
            // });
            // myDoc.end();

        } catch (error) {
            logger.error(`Error fetching data for account statement:${error}`);
            return new Error(`Error fetching data for account statement:${error}`);
        }
    }



    async populateDataBase() {

        await DB2_Connection.addAccountStatement('03015091633', '2020-04-26', '010251945118', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-05-26', '010099506871', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-06-26', '010066562540', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-07-26', '009949357057', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-08-26', '009949336951', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-09-26', '009853747702', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-10-26', '009853729040', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-11-26', '009706631601', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-12-26', '009660266614', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('03015091633', '2020-04-26', '010251945119', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-05-26', '010099506870', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-06-26', '010066562541', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-07-26', '009949357058', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-08-26', '009949336950', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-09-26', '009853747703', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-10-26', '009853729041', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-11-26', '009706631603', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-12-26', '009660266611', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('03015091633', '2020-04-26', '010251945118', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-05-26', '010099506871', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-06-26', '010066562540', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-07-26', '009949357059', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-08-26', '009949336959', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-09-26', '009853747708', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-10-26', '009853729048', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-11-26', '009706631600', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-12-26', '009660266612', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('12345678991', '2020-04-26', '010251945117', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-05-26', '010099506870', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-06-26', '010066562541', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-07-26', '009949357058', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-08-26', '009949336950', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-09-26', '009853747703', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-10-26', '009853729041', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-11-26', '009706631603', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('12345678991', '2020-12-26', '009660266611', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('15683298498', '2020-04-26', '010251945119', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('15683298498', '2020-05-26', '010099506870', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('15683298498', '2020-06-26', '010066562541', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('15683298498', '2020-07-26', '009949357058', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('15683298498', '2020-08-26', '009949336950', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('15683298498', '2020-09-26', '009853747703', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('15683298498', '2020-10-26', '009853729041', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('15683298498', '2020-11-26', '009706631603', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('15683298498', '2020-12-26', '009660266611', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('01088832984', '2020-04-26', '010251945119', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('01088832984', '2020-05-26', '010099506870', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('01088832984', '2020-06-26', '010066562541', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('01088832984', '2020-07-26', '009949357058', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('01088832984', '2020-08-26', '009949336950', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('01088832984', '2020-09-26', '009853747703', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('01088832984', '2020-10-26', '009853729041', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('01088832984', '2020-11-26', '009706631603', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('01088832984', '2020-12-26', '009660266611', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('48485954493', '2020-04-26', '010251945119', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('48485954493', '2020-05-26', '010099506870', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('48485954493', '2020-06-26', '010066562541', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('48485954493', '2020-07-26', '009949357058', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('48485954493', '2020-08-26', '009949336950', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('48485954493', '2020-09-26', '009853747703', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('48485954493', '2020-10-26', '009853729041', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('48485954493', '2020-11-26', '009706631603', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('48485954493', '2020-12-26', '009660266611', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('03015091633', '2020-04-26', '0102519451191', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-05-26', '0100995068701', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-06-26', '0100665625411', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-07-26', '0099493570581', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-08-26', '0099493369501', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-09-26', '0098537477031', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-10-26', '0098537290411', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-11-26', '0097066316031', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-12-26', '0096602666111', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('03015091633', '2020-04-26', '0102519451192', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-05-26', '0100995068702', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-06-26', '0100665625412', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-07-26', '0099493570582', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-08-26', '0099493369502', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-09-26', '0098537477032', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-10-26', '0098537290412', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-11-26', '0097066316032', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-12-26', '0096602666112', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('03015091633', '2020-04-26', '0102519451193', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-05-26', '0100995068703', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-06-26', '0100665625413', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-07-26', '0099493570583', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-08-26', '0099493369503', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-09-26', '0098537477033', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-10-26', '0098537290413', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-11-26', '0097066316033', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('03015091633', '2020-12-26', '0096602666113', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
        await DB2_Connection.addAccountStatement('59324995345', '2020-04-26', '0102519451194', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
        await DB2_Connection.addAccountStatement('59324995345', '2020-05-26', '0100995068704', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
        await DB2_Connection.addAccountStatement('59324995345', '2020-06-26', '0100665625414', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
        await DB2_Connection.addAccountStatement('59324995345', '2020-07-26', '0099493570584', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
        await DB2_Connection.addAccountStatement('59324995345', '2020-08-26', '0099493369504', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
        await DB2_Connection.addAccountStatement('59324995345', '2020-09-26', '0098537477034', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
        await DB2_Connection.addAccountStatement('59324995345', '2020-10-26', '0098537290414', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
        await DB2_Connection.addAccountStatement('59324995345', '2020-11-26', '0097066316034', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
        await DB2_Connection.addAccountStatement('59324995345', '2020-12-26', '0096602666114', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);

    }
    async test() {
        const PDFDocument = require('../util/PDFDocumentWithTables');
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(imageDIR + 'output2.pdf'));
        const data = await DB2_Connection.getValueArray('03015091633', '2021-10-01', '2001-02-01');
        const data2 = await DB2_Connection.getValue('03015091633', '2021-10-01', '2001-02-01');

        console.log("Array Format statement" + data);
        console.log("String Format statement" + data2);
        const table = {
            headers: ['MSISDN', 'Trx DateTime', 'Trx ID', 'Transaction Type', 'Channel', 'Description', 'Amount debited', 'Amount credited', 'Running balance'],
            rows: data
        };

        // doc.table(table0, {
        //     prepareHeader: () => doc.font('Helvetica-Bold').fontSize(5),
        //     prepareRow: (row, i) => doc.font('Helvetica').fontSize(5)
        // });

        // const table1 = {
        //     headers: ['MSISDN', 'Trx DateTime', 'Trx ID', 'Transaction Type', 'Channel', 'Description', 'Amount debited', 'Amount credited', 'Running balance'],
        //     rows: data
        // };

        // doc.moveDown().table(table1, 100, 350, { width: 300 });

        doc.end();
        return;
    }


}

export default accountStatementService;