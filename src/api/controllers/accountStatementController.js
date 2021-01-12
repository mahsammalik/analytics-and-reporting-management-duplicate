import { accountStatementService, Subscriber } from '/services/';
import { logger, mappedMetaData } from '/util/';
import { getUserProfile } from '/services/helpers/';

class accountStatementController {

    async calculateAccountStatement(req, res, next) {
        try {
            logger.info({ event: 'Entered function', functionName: 'calculateAccountStatement in class accountStatementController', request: req.url, header: req.headers, query: req.query });

            let metadataHeaders = req.headers['x-meta-data'];

            if (metadataHeaders && metadataHeaders.substring(0, 2) === "a:") metadataHeaders = metadataHeaders.replace("a:", "")

            console.log("Headers METADATA --------**************", metadataHeaders);
            const metadata = mappedMetaData(metadataHeaders ? metadataHeaders : false);
            const userProfile = await getUserProfile(req.headers);
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
                merchantName: userProfile.businessName || ''

            };
            console.log("Headers PAYLOAD --------**************", payload);

            const subscriber = new Subscriber();
            await subscriber.event.produceMessage(payload, config.kafkaBroker.topics.App_Merchant_Account_Statement);

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
}
export default accountStatementController;