import accountStatementController from '../controllers/accountStatementController';
import taxStatementController from '../controllers/taxStatementController';
import { msisdnParserMW, responseCodeMW } from '../middlewares';
import express from 'express';

const router = express.Router();

router.post(
    '/account', msisdnParserMW({ bodyKeys: ['msisdn', 'msisdn1'], paramKeys: ['msisdn', 'x-msisdn-11'] }), accountStatementController.calculateAccountStatement, responseCodeMW
);
router.get(
    '/tax', msisdnParserMW(), taxStatementController.calculateTaxStatement, responseCodeMW
);

export default router;