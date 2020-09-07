import accountStatementController from '../controllers/accountStatementController';
import taxStatementController from '../controllers/taxStatementController';
import { msisdnParserMW, responseCodeMW } from '../middlewares';
import express from 'express';
// import path from 'path';
// const swaggerPath = `${path.dirname(__dirname)}/../definitions/AccountAndTaxStatement.yml`;
// console.log(swaggerPath);

const router = express.Router();

router.get('/account', msisdnParserMW(), accountStatementController.calculateAccountStatement, responseCodeMW);
router.get('rest/api/v1/reports/statement/tax', msisdnParserMW(), taxStatementController.calculateTaxStatement, responseCodeMW);

export default router;