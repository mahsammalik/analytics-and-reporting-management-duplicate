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

    async calculateAccountStatement(req, res) {
      const headersValidationResponse = validations.verifySchema(
        schema.REQUEST_HEADER_SCHEMA,
        req.headers
      );
      const queryValidationResponse = validations.verifySchema(schema.Account_Statement_SCHEMA, req.query);

      if (!headersValidationResponse.success) {
        const responseCodeForAccountStatementHeader = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.missing_required_parameters, headersValidationResponse);
        return res.status(422).send(responseCodeForAccountStatementHeader);
      }
      if (!queryValidationResponse.success) {
        const responseCodeForAccountStatementQuery  = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.missing_required_parameters, queryValidationResponse);
        console.log(queryValidationResponse)
        return res.status(422).send(responseCodeForAccountStatementQuery);
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
          
      }
      console.log("payload" + payload)
   
      let responseCodeForAccountStatementQuery  = 
       {
        "success": true,
        "responseCode": "AR-AS-T03",
        "responseMessage_en": "The Email send succefully.",
        "responseMessage_ur": "The Email send succefully."
      }
      // await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.success, "Email send successful");;
      if (payload.format == 'pdf')
      // res.status(200).json(responseCodeForAccountStatementQuery);
         response = await this.accountStatementService.sendEmailPDF_Format(payload, res);
      else if (payload.format == 'csv') 
        // res.status(200).send(responseCodeForAccountStatementQuery);
        response = await this.accountStatementService.sendEmailCSV_Format(payload);

       
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



