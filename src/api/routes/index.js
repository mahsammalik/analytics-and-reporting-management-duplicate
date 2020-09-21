import { accountStatementController } from '../controllers/';
import taxStatementController from '../controllers/taxStatementController';
import { msisdnParserMW, responseCodeMW, requestLoggerMW } from '../middlewares';
import express from 'express';

const router = express.Router();
const accountStatement = new accountStatementController();
router.get(
    '/account', msisdnParserMW(), accountStatement.calculateAccountStatement, responseCodeMW, requestLoggerMW
);
router.get(
    '/tax', msisdnParserMW(), taxStatementController.calculateTaxStatement, responseCodeMW, requestLoggerMW
);

export default router;