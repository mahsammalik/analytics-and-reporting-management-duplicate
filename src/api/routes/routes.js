import accountStatementController from '../controllers/AccountStatementController';
import taxStatementController from '../controllers/taxStatementController';

export default (app) => {

  app.get('/rest/api/v1/reports/statement/account', accountStatementController.calculateAccountStatement); 
  app.get('/rest/api/v1/reports/statement/tax', taxStatementController.calculateTaxStatement); 

};