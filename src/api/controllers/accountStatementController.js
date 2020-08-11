import Controller from './controller';
import accountStatementService from '../../services/accountStatementService.js';

class accountStatementController extends Controller {
    
    constructor(service) {
        super(service);
    }

    async calculateAccountStatement(req, res) {
        if (req.query.start_date == undefined)
          res.status(404).json('Missing Start Date');
        if (req.query.end_date == undefined)
          res.status(404).json('Missing End Date');
        if (req.query.msisdn == undefined)
          res.status(404).json('Missing user\'s mobile number');
        if (req.query.request !== 'Email' || req.query.request !== 'Download')
          res.status(404)
            .send('Please send the request with either Download or Email requirement');
        if (req.query.request == undefined)
          res.status(404).json('Missing request requirement');
        let payload = { 
          msisdn: req.query.msisdn,
          start_date: req.query.start_date,
          end_date: req.query.end_date,
          email: req.qyuer.email,
          subject: req.query.subject,
          html: req.query.html
      }
      accountStatementService.accountStatementCall(payload, res);
    }
  }
       
export default new accountStatementController(accountStatementService);



