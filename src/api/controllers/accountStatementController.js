import accountStatementService from '../../services/accountStatementService';
import Controller from './controller';
import validations from './validators/validations';
import schema from './validators/schema.json';
import responseCodeHandler from '../../util/responseCodeHandler';


class accountStatementController {

    constructor(service) {
        this.accountStatementService = service;
        this.calculateAccountStatement = this.calculateAccountStatement.bind(this);
    }

    async calculateAccountStatement(req, res, next) {
        const headersValidationResponse = validations.verifySchema(
            schema.REQUEST_HEADER_SCHEMA,
            req.headers
        );
        const queryValidationResponse = validations.verifySchema(schema.Account_Statement_SCHEMA, req.query);

        if (!headersValidationResponse.success) {
            const responseCodeForAccountStatementHeader = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.missing_required_parameters, headersValidationResponse);
            res.status(422).send(responseCodeForAccountStatementHeader);
        }
        if (!queryValidationResponse.success) {
            const responseCodeForAccountStatementQuery = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.missing_required_parameters, queryValidationResponse);
            console.log(queryValidationResponse);
            res.status(422).send(responseCodeForAccountStatementQuery);
        }
        if (req.start_date >= req.end_date) {
            const responseCodeForAccountStatementQuery = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.date_invalid, "");
            console.log(queryValidationResponse);
            res.status(422).send(responseCodeForAccountStatementQuery);
        }
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

        console.log(`payload ${JSON.stringify(payload)}`);


        // await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.success, "Email send successful");;

        res.locals.response = payload.format === 'pdf' ? await this.accountStatementService.sendEmailPDF_Format(payload, res) : await this.accountStatementService.sendEmailCSV_Format(payload);
        next();



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
export default new accountStatementController(accountStatementService);