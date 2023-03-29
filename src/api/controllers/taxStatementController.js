import taxStatementService from '../../services/taxStatementService';
import Controller from './controller';
import validations from './validators/validationEnhanced';
import responseCodeHandler from '../../util/responseCodeHandler';
import { logger, mappedMetaData } from '/util/';
import getUserProfile from '../../services/helpers/accountProfile';

const accStmtResponseCodes = config.responseCode.useCases.accountStatement;

class taxStatementController {

    constructor(service) {
        this.taxStatementService = service;
        this.calculateTaxStatement = this.calculateTaxStatement.bind(this);
        this.calculateTaxStatement2 = this.calculateTaxStatement2.bind(this);
    }

    async calculateTaxStatement(req, res, next) {
        try{
            let thirdParty = req.get('X-CHANNEL') || req.get('x-channel');
        let headersValidationResponse;
        if(thirdParty === 'consumerUSSD' || thirdParty === 'merchantUSSD'){
            headersValidationResponse = validations.verifySchema("USSD_HEADER_SCHEMA", req.headers);
        }else{
            headersValidationResponse =   validations.verifySchema("REQUEST_HEADER_SCHEMA", req.headers);
        }
        if (!headersValidationResponse.success) {
            const badHeader = await responseCodeHandler.getResponseCode(accStmtResponseCodes.missing_required_parameters, headersValidationResponse);
            return res.status(422).send(badHeader);
        }
        const queryValidationResponse   =   validations.verifySchema("Tax_Statement_SCHEMA", req.query);
        if (!queryValidationResponse.success) {
            const badQueryParam = await responseCodeHandler.getResponseCode(accStmtResponseCodes.missing_required_parameters, queryValidationResponse);
            logger.debug(queryValidationResponse);
            return res.status(422).send(badQueryParam);
        }
        const metadataHeaders = req.headers['x-meta-data'];
        const metadata = mappedMetaData(metadataHeaders ? metadataHeaders : false);
        const userProfile = await getUserProfile(req.headers);
        logger.debug({ userProfile });
        logger.debug(metadata," metadata")
        let payload = {
            msisdn: req.headers['x-msisdn'],
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            request: req.query.requestType,
            email: req.query.email || metadata.emailAddress,
            subject: 'Hello',
            html: '<html></html>',
            format: req.query.format,
            year: req.query.year,
            metadata,
            merchantName: userProfile.businessName || '',
            accountLevel: userProfile.accountLevel || ''

        };

        res.locals.response = await this.taxStatementService.sendTaxStatement(payload, res);
        next();
        }catch(err){
            console.log('CError', err)
            logger.error('Error', err);
            res.locals.response = false;
            next();
        }
    }


    async calculateTaxStatement2(req, res, next) {
        try {
            logger.info({ event: 'Entered function', functionName: 'calculateTaxStatement2 in class taxStatementController', request: req.url, header: req.headers, query: req.query });

            const headersValidationResponse =   validations.verifySchema("REQUEST_HEADER_SCHEMA", req.headers);
            const queryValidationResponse   =   validations.verifySchema("Tax_Statement_SCHEMA", req.query);

            if (!headersValidationResponse.success) {
                const badHeader = await responseCodeHandler.getResponseCode(accStmtResponseCodes.missing_required_parameters, headersValidationResponse);
                return res.status(422).send(badHeader);
            }
            if (!queryValidationResponse.success) {
                const badQueryParam = await responseCodeHandler.getResponseCode(accStmtResponseCodes.missing_required_parameters, queryValidationResponse);
                logger.debug(queryValidationResponse);
                return res.status(422).send(badQueryParam);
            }
            const metadataHeaders = req.headers['x-meta-data'];
            const metadata = mappedMetaData(metadataHeaders ? metadataHeaders : false);
            const userProfile = await getUserProfile(req.headers);
            logger.debug({ userProfile });
            logger.debug(metadata," metadata")
            let payload = {
                msisdn: req.headers['x-msisdn'],
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                request: req.query.requestType,
                email: req.query.email || metadata.emailAddress,
                subject: 'Hello',
                html: '<html></html>',
                format: req.query.format,
                metadata,
                merchantName: userProfile.businessName || '',
                accountLevel: userProfile.accountLevel || ''

            };

            res.locals.response = await this.taxStatementService.sendTaxStatementNew(payload, res);
            logger.info({ event: 'Exited function', functionName: 'calculateTaxStatement2 in class taxStatementController' });
            next();

        } catch (error) {
            logger.error({ event: 'Error thrown', functionName: 'calculateTaxStatement2 in class taxStatementController', 'error': { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, query: req.query });

            logger.info({ event: 'Exited function', functionName: 'calculateTaxStatement2 in class taxStatementController' });

            res.locals.response = false;
            next();
        }
        //   const responseCodeForTaxStatementQuery = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.success, "");;
        //   res.status(200).json(responseCodeForTaxStatementQuery);


        // if(response == 'Database Error'){
        //    responseCodeForAccountStatementQuery  = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, "Database Error");
        //    res.status(500).send(responseCodeForAccountStatementQuery);
        // }else if (response == 'Error in sending email'){
        //   logger.debug("enter the correct conditiion")
        //   responseCodeForAccountStatementQuery  = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.email_problem, "Email service issue");
        //   res.status(422).send(responseCodeForAccountStatementQuery);
        // }  else if (response == 'Email send Succefull'){
        //   responseCodeForAccountStatementQuery  = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.success, "Email send successful");
        //   res.status(200).send(responseCodeForAccountStatementQuery);
        // }else if (response == 'PDF creation error'){
        //   responseCodeForAccountStatementQuery  = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.pdf_internal_error, "Internal error");
        //   res.status(500).send(responseCodeForAccountStatementQuery);
        // }

    }
}
export default new taxStatementController(taxStatementService);