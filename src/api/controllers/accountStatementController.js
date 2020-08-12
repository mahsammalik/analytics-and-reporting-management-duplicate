import accountStatementService from '../../services/accountStatementService';
import Controller from './controller';

class accountStatementController {
    
    constructor(service) {
        this.accountStatementService = service;
        this.calculateAccountStatement = this.calculateAccountStatement.bind(this);
    }

    async calculateAccountStatement(req, res) {
        if (req.query.start_date == undefined)
          res.status(422).json('Missing Start Date');
        if (req.query.end_date == undefined)
          res.status(422).json('Missing End Date');
        if (req.query.request == undefined)
          res.status(422).json('Missing request requirement');
        console.log(req.headers);
        // if (req.headers['x-msisdn'] == undefined)
        //   res.status(422).json('Missing user\'s mobile number');
        // if (req.headers['x-meta-data'] == '')
        //   res.status(422).json('Missing user\'s email');
        let payload = { 
          msisdn: req.headers['X-MSISDN'],
          start_date: req.query.start_date,
          end_date: req.query.end_date,
          email: req.headers['X-META-DATA'],
          subject: 'Hello',
          html: '<html></html>'
      }
      console.log("payload" + payload)
      console.log("service" + this.accountStatementService)
      await this.accountStatementService.accountStatementCall(payload, res);
    }
  }
export default new accountStatementController(accountStatementService);



