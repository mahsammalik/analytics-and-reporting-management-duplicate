import { accountStatementController } from '../controllers/';
import taxStatementController from '../controllers/taxStatementController';
import excelExportController from '../controllers/excelExportController';

import { msisdnParserMW, responseCodeMW, requestLoggerMW } from '../middlewares';
import express from 'express';

const router = express.Router();
const accountStatement = new accountStatementController();
router.get(
    '/account', msisdnParserMW(), accountStatement.calculateAccountStatement, responseCodeMW,
);
router.get(
    '/tax', msisdnParserMW(), taxStatementController.calculateTaxStatement, responseCodeMW,
);

router.get(
    '/ibft/export/:startDate/:endDate', excelExportController.jazzcashIncomingExport
);

router.get(
    '/ussd/export/:startDate/:endDate', excelExportController.jazzcashOutgoingExport
);

export default router;