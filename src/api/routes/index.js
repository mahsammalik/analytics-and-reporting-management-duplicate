import accountStatementController from '../controllers/accountStatementController';
import taxStatementController from '../controllers/taxStatementController';
import { msisdnParserMW, responseCodeMW, requestLoggerMW } from '../middlewares';
import express from 'express';

const router = express.Router();

router.get(
    '/account', msisdnParserMW({ paramKeys: ['msisdn'] }), accountStatementController.calculateAccountStatement, responseCodeMW, requestLoggerMW
);
router.get(
    '/tax', msisdnParserMW(), taxStatementController.calculateTaxStatement, responseCodeMW, requestLoggerMW
);

export default router;