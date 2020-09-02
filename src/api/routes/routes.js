import accountStatementController from '../controllers/accountStatementController';
import taxStatementController from '../controllers/taxStatementController';
import { msisdnParserMW, responseCodeMW } from '../middlewares';

const routes = (app) => {

    app.get(
        '/rest/api/v1/reports/statement/account', msisdnParserMW(), accountStatementController.calculateAccountStatement, responseCodeMW
    );
    app.get(
        '/rest/api/v1/reports/statement/tax', msisdnParserMW(),
        taxStatementController.calculateTaxStatement, responseCodeMW
    );
};

export default routes;