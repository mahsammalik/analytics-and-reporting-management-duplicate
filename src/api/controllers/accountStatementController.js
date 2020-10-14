import { accountStatementService } from '/services/';
import { logger } from '/util/';

class accountStatementController {

    async calculateAccountStatement(req, res, next) {
        try {
            logger.info({ event: 'Entered function', functionName: 'calculateAccountStatement in class accountStatementController', request: req.url, header: req.headers, query: req.query });
            let payload = {
                msisdn: req.headers['x-msisdn'],
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                request: req.query.requestType,
                email: req.headers['x-meta-data'],
                subject: 'Hello',
                html: '<html></html>',
                format: req.query.format

            };


            const accountStatement = new accountStatementService();
            res.locals.response = payload.format === 'pdf' ? await accountStatement.sendEmailPDFFormat(payload) : await accountStatement.sendEmailCSVFormat(payload);
            logger.info({ event: 'Exited function', functionName: 'calculateAccountStatement in class accountStatementController' });
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