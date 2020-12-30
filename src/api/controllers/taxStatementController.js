import taxStatementService from '../../services/taxStatementService';
import Controller from './controller';
import validations from './validators/validations';
import schema from './validators/schema.json';
import responseCodeHandler from '../../util/responseCodeHandler';
import { logger, mappedMetaData } from '/util/';

class taxStatementController {

    constructor(service) {
        this.taxStatementService = service;
        this.calculateTaxStatement = this.calculateTaxStatement.bind(this);
    }

    async calculateTaxStatement(req, res, next) {
        const headersValidationResponse = validations.verifySchema(
            schema.REQUEST_HEADER_SCHEMA,
            req.headers
        );
        const queryValidationResponse = validations.verifySchema(schema.Tax_Statement_SCHEMA, req.query);

        if (!headersValidationResponse.success) {
            const responseCodeForAccountStatementHeader = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.missing_required_parameters, headersValidationResponse);
            return res.status(422).send(responseCodeForAccountStatementHeader);
        }
        if (!queryValidationResponse.success) {
            const responseCodeForAccountStatementQuery = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.missing_required_parameters, queryValidationResponse);
            console.log(queryValidationResponse);
            return res.status(422).send(responseCodeForAccountStatementQuery);
        }
        const metadataHeaders = req.headers['x-meta-data'];
        const metadata = mappedMetaData(metadataHeaders ? metadataHeaders : false);
        const userProfile = await getUserProfile(req.headers);
        logger.debug({ userProfile });
        let payload = {
            msisdn: req.headers['x-msisdn'],
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            request: req.query.requestType,
            email: metadata.emailAddress,
            subject: 'Hello',
            html: '<html></html>',
            format: req.query.format,
            metadata,
            merchantName: userProfile.businessDetails.businessName || ''

        };

        res.locals.response = await this.taxStatementService.sendTaxStatement(payload, res);
        next();

        //   const responseCodeForTaxStatementQuery = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.success, "");;
        //   res.status(200).json(responseCodeForTaxStatementQuery);


        // if(response == 'Database Error'){
        //    responseCodeForAccountStatementQuery  = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, "Database Error");
        //    res.status(500).send(responseCodeForAccountStatementQuery);
        // }else if (response == 'Error in sending email'){
        //   console.log("enter the correct conditiion")
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