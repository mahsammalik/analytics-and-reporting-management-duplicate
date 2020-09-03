import accountStatementController from '../controllers/accountStatementController';
import taxStatementController from '../controllers/taxStatementController';
import { msisdnParserMW, responseCodeMW } from '../middlewares';
import express from 'express';

const router = express.Router();

router.get(
    '/account', msisdnParserMW(), accountStatementController.calculateAccountStatement, responseCodeMW
);
router.get(
    '/tax', msisdnParserMW(), taxStatementController.calculateTaxStatement, responseCodeMW
);

export default router;