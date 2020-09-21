import { accountStatementService } from '../../services/';
import Controller from './controller';
import validations from './validators/validations';
import schema from './validators/schema.json';
import responseCodeHandler from '../../util/responseCodeHandler';


class accountStatementController {

    async calculateAccountStatement(req, res, next) {
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
        const accountStatement = new accountStatementService();
        res.locals.response = payload.format === 'pdf' ? await accountStatement.sendEmailPDF_Format(payload) : await accountStatement.sendEmailCSV_Format(payload);
        console.log(res.locals.response);
        return next();



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
export default accountStatementController;