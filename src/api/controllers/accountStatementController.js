import { accountStatementService, Subscriber } from '/services/';
import { logger, mappedMetaData } from '/util/';
import { getUserProfile } from '/services/helpers/';
import { accountStatementTemplate, createPDF } from '../../util';
import moment from 'moment';
class accountStatementController {

    async calculateAccountStatement(req, res, next) {
        try {
            logger.info({ event: 'Entered function', functionName: 'calculateAccountStatement in class accountStatementController', request: req.url, header: req.headers, query: req.query });

            let metadataHeaders = req.headers['x-meta-data'];

            if (metadataHeaders && metadataHeaders.substring(0, 2) === "a:") metadataHeaders = metadataHeaders.replace("a:", "")

            const metadata = mappedMetaData(metadataHeaders ? metadataHeaders : false);
            logger.debug(`getting userProfile : `)
            const userProfile = await getUserProfile(req.headers);
            logger.debug(mappedMetaData({ accountLevel: userProfile.accountLevel }), "CHECK MAPPED DATA", metadataHeaders)
            logger.debug(`Obtained user profile as follows : `)
            logger.debug({ userProfile });
            if (!req.query.email) {
                return res.status(401).send({ success: false, message: "Email Not Provided" });
            }
            const payload = {
                msisdn: req.headers['x-msisdn'],
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                request: req.query.requestType,
                email: req.query.email,
                subject: 'Hello',
                html: '<html></html>',
                format: req.query.format,
                metadata,
                merchantName: userProfile.businessName || '',
                accountLevel: userProfile.accountLevel || ''
            };
            logger.debug(payload, "payload")
            // const subscriber = new Subscriber();
            // await subscriber.event.produceMessage(payload, config.kafkaBroker.topics.App_Merchant_Account_Statement);
            const accountStatement = new accountStatementService();
            if (payload.format === 'pdf') await accountStatement.sendEmailPDFFormat(payload)
            else await accountStatement.sendEmailCSVFormat(payload);

            const subscriber = new Subscriber();
            //subscriber.setConsumer(); 
            logger.debug(`============PRODUCING MESSAGE OF ACCOUNT STATEMENT======================`)
            await subscriber.event.produceMessage(payload, config.kafkaBroker.topics.App_Merchant_Account_Statement);
            logger.debug(`============DONE PRODUCING MESSAGE OF ACCOUTN STATEMENT==================`)

            // const accountStatement = new accountStatementService();
            // if (payload.format === 'pdf') await accountStatement.sendEmailPDFFormat(payload)
            // else await accountStatement.sendEmailCSVFormat(payload);
            logger.info({ event: 'Exited function', functionName: 'calculateAccountStatement in class accountStatementController' });
            res.locals.response = true;
            return next();

        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'calculateAccountStatement in class accountStatementController', 'error': { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, query: req.query });

            logger.info({ event: 'Exited function', functionName: 'calculateAccountStatement in class accountStatementController' });

            res.locals.response = false;
            return next();
        }
    }
    async calculateAccountStatementTEMPLATE(req, res, next) {
        let newdata = []
        for(let i = 0 ; i <2 ; i ++){
            newdata.push([
                "923042227396",
                "2021-04-06 21:36:27.000000",
                "10712297927",
                "Transfer(C2C)",
                "Customer transfer of funds to another customer - 923079770500",
                "5000",
                "0",
                "490100"
            ])
        }
        let pdfFile = await createPDF({
            template: accountStatementTemplate({
                headers: ["Date", "Transaction ID", "Transaction Type", "Channel", "Description", "Amount Debited", "Amount Credited", "Running Balance\n"],
                data: newdata.map(arr => {
                    let newTransId = arr[0];
                    arr[0] = moment(arr[1]).format('DD-MMM-YYYY HH:mm:ss');
                    arr[1] = newTransId;
                    arr[4] = arr[4].replace(/\d(?=\d{4})/g, "*")
                    return arr;
                }),
                payload: {
                    msisdn: '923462381235',
                    start_date: '2021-01-15',
                    end_date: '2021-01-25',
                    request: 'Email',
                    email: 'muhammad.saleem2@ibm.com',
                    subject: 'Hello',
                    html: '<html></html>',
                    format: 'pdf',
                    metadata: {
                        msisdn: '923462381235',
                        cnic: '4220106096461',
                        accountLevel: undefined,
                        emailAddress: 'muhammad.saleem2@ibm.com',
                        firstName: 'Omer Saleemmm',
                        LastName: '',
                        profileImageURL: '2b880809-c586-4f4b-916c-7ab930e4e4e5.jpg',
                        customerType: 'customer',
                        language: undefined,
                        dateOfBirth: '01221951',
                        isLoggedInOnce: false,
                        undefined: 'b75bffa2ffef4e9bf160c25eda22596f'
                    },
                    merchantName: ''

                }
            }),
            fileName: `Account Statement`
        });
        console.log(pdfFile, "pdfFile")
        
        // return res.status(200).send({success:true, 'pdf': Buffer.from(pdfFile, 'base64').toString('base64')})
        return res.status(200).send({success:true})

    }
    async calculateAccountStatementWithoutKafka(req, res, next) {
        try {
            logger.info({ event: 'Entered function', functionName: 'main calculateAccountStatement in class accountStatementController', request: req.url, header: req.headers, query: req.query });

            let metadataHeaders = req.headers['x-meta-data'];

            if (metadataHeaders && metadataHeaders.substring(0, 2) === "a:") metadataHeaders = metadataHeaders.replace("a:", "")

            const metadata = mappedMetaData(metadataHeaders ? metadataHeaders : false);
            const userProfile = await getUserProfile(req.headers);
            logger.debug(mappedMetaData({ accountLevel: userProfile.accountLevel }), "CHECK MAPPED DATA")

            logger.debug({ userProfile });
            if (!req.query.email) {
                return res.status(401).send({ success: false, message: "Email Not Provided" });
            }
            const payload = {
                msisdn: req.headers['x-msisdn'],
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                request: req.query.requestType,
                email: req.query.email,
                subject: 'Hello',
                html: '<html></html>',
                format: req.query.format,
                metadata,
                merchantName: userProfile.businessName || '',
                accountLevel: userProfile.accountLevel || '',
                channel: req.headers['x-channel']
            };
            logger.debug(payload, "payload")

            const accountStatement = new accountStatementService();
            if (payload.format === 'pdf') await accountStatement.sendEmailPDFFormat(payload)
            else await accountStatement.sendEmailCSVFormat(payload);

            logger.info({ event: 'Exited function', functionName: 'main calculateAccountStatement in class accountStatementController' });
            res.locals.response = true;
            return next();

        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'main calculateAccountStatement in class accountStatementController', 'error': { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, query: req.query });

            logger.info({ event: 'Exited function', functionName: 'main calculateAccountStatement in class accountStatementController' });

            res.locals.response = false;
            return next();
        }
    }
}
export default accountStatementController;