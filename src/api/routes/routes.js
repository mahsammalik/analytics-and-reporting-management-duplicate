import accountStatementController from '../controllers/AccountStatementController';

export default (app) => {

  app.get('/rest/api/v1/reports/statement/account', accountStatementController.calculateAccountStatement); 
};