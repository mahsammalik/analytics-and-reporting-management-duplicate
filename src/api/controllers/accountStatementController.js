import { accountStatementService, Subscriber } from '/services/';
import { logger, mappedMetaData } from '/util/';
import { getUserProfile } from '/services/helpers/';

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