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
            let mappedMSISDN = await MsisdnTransformer.formatNumberSingle(payload.msisdn, payload.msisdn.startsWith('03') ? 'international' : 'local'); //payload.msisdn.substring(2); // remove 923****** to be 03******
            const data = await DB2Connection.getTaxValueArray(payload.msisdn, mappedMSISDN,  payload.end_date, payload.start_date);
            logger.debug("the output of changing database " + data);
            if (data === 'Database Error') return "Database Error";
            let db2Data = await DB2Connection.getLatestAccountBalanceValue(payload.msisdn, mappedMSISDN, payload.start_date , payload.end_date);
            // const updatedRunningbalance = await DB2Connection.getLatestAccountBalanceValue2(payload.msisdn, mappedMSISDN, payload.end_date);
            const updatedRunningbalance = this.extractBalance(db2Data) || 0.00
            if (db2Data.length > 0) {
                console.log("db2Data ==================>",db2Data)
                console.log("data[0][8] ==================>",data[0][8])
                console.log("updatedRunningbalance ==================>",updatedRunningbalance/100)
                // if description column is null then replace it with HTML hidden space
                db2Data = db2Data.map(arr => {
                    if(arr[5] == null)
                        arr[5] = '&#8203';  // &#8203 for HTML hidden space
                    return arr;
                });
        
                db2Data = db2Data.map((dat) => {
                    dat.splice(0, 1);
                    let b = dat[1];
                    dat[1] = dat[0];
                    dat[0] = b;
                    return dat
                }).sort(function (a, b) {
                    var dateA = new Date(a[1]), dateB = new Date(b[1]);
                    return dateA - dateB;
                })

                db2Data = db2Data.map(arr => {
                    let newTransId = arr[0];
                    arr[0] = moment(arr[1]).format('DD-MMM-YYYY HH:mm:ss');
                    arr[1] = newTransId;
                    arr[4] = arr[4] ? arr[4].replace(/\d(?=\d{4})/g, "*") : '';
                    return arr;
                })
            }


            logger.info(`Step 02: Obtained running balance ${updatedRunningbalance}`)

            logger.debug(`Array Format statement ${JSON.stringify(data)}`, updatedRunningbalance, "updatedRunningbalance ");

            payload['updatedRunningbalance'] = updatedRunningbalance || 0.00;
            const accountData = {
                headers: ['MSISDN', 'Trx ID', 'Trx DateTime', 'Total Tax Deducted', 'Sales Tax', 'Income Tax', 'Withholding Tax', 'Fee', 'Commission'],
                data,
                data2: db2Data,
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
    extractBalance = (data) =>  data[0][8] || 0
}

export default new taxStatementService();