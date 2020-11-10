import {
    logger,
    createPDF,
    accountStatementTemplate,
    Notification,
    DB2Connection
} from '/util/';

class accountStatementService {

    async sendEmailCSVFormat(payLoad) {
        try {

            const data = await DB2Connection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);

            let header = ["Transaction ID, Transaction DateTime, MSISDN, Transaction Type, Channel, Description, Amount debited, Amount credited, Running balance\n"];
            header = header.join(',');
            const csvData = new Buffer.from(header + data).toString('base64');
            // console.log(`csvData ${csvData}`);

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
                filename: 'AccountStatement.csv',
                content: csvData,
                type: 'base64',
                embedImage: false
            }];
            return await new Notification.sendEmail('jazzcash.test.user@gmail.com', 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);

        } catch (error) {
            logger.error(error);
            return new Error(`Error mailing csv:${error}`);
        }


    }

    async sendEmailPDFFormat(payload) {

        try {
            logger.info({ event: 'Entered function', functionName: 'sendEmailPDFFormat' });

            const data = await DB2Connection.getValueArray(payload.msisdn, payload.end_date, payload.start_date);

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
                filename: 'AccountStatement.pdf',
                content: pdfFile,
                type: 'base64',
                embedImage: false
            }];

            logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });

            return await new Notification.sendEmail('jazzcash.test.user@gmail.com', 'Account Statement', '', attachment, 'ACCOUNT_STATEMENT', emailData);

        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'sendEmailPDFFormat', error, payload });
            logger.info({ event: 'Exited function', functionName: 'sendEmailPDFFormat' });

            throw new Error(`Error fetching data for account statement:${error}`);
        }
    }

}

export default accountStatementService;