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
        balanceResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.missing_required_parameters, headersValidationResponse);
        return res.status(422).send(balanceResponse);
      }
      if (!queryValidationResponse.success) {
        balanceResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.missing_required_parameters, queryValidationResponse);
        return res.status(422).send(balanceResponse);
      }
        // if (req.query.start_date == undefined)
        //   res.status(422).json('Missing Start Date');
        // if (req.query.end_date == undefined)
        //   res.status(422).json('Missing End Date');
        // if (req.query.request == undefined)
        //   res.status(422).json('Missing request requirement');
        // console.log(req.headers);
        // if (req.headers['x-msisdn'] == undefined)
        //   res.status(422).json('Missing user\'s mobile number');
        // if (req.headers['x-meta-data'] == '')
        //   res.status(422).json('Missing user\'s email');
        let payload = { 
          msisdn: req.headers['x-msisdn'],
          start_date: req.query.start_date,
          end_date: req.query.end_date,
          request: req.query.request,
          email: req.headers['x-meta-data']['email'],
          subject: 'Hello',
          html: '<html></html>'
      }
      console.log("payload" + payload)
      console.log("service" + this.accountStatementService)
      await this.accountStatementService.accountStatementCall(payload, res);
    }
  }
export default new accountStatementController(accountStatementService);



