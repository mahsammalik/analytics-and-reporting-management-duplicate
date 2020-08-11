import CustomerController from '../controllers/customerController';
import upload from '../middlewares/uploadMiddleware';
import accountStatementController from '../controllers/AccountStatementController';
import accountStatementService from '../../services/AccountStatementService';

export default (app) => {

  app.get('/rest/api/v1/reports/statement/account', accountStatementController.calculateAccountStatement);
  
};