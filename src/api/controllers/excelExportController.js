import ExcelExportService from '../../services/excelExportService';
import _ from 'lodash';
import logger from '../../util/logger';

class excelExportController {
  constructor(service) {
    this.ExcelExportService = service;

    this.jazzcashIncomingExport = this.jazzcashIncomingExport.bind(this);
    this.jazzcashOutgoingExport = this.jazzcashOutgoingExport.bind(this);
  }

  async jazzcashIncomingExport(req, res) {
    logger.info({ event: 'Entered function', functionName: 'jazzcashIncomingExport in class excelExportController', request: req.url, header: req.headers, query: req.query });
    try {
      this.ExcelExportService.jazzcashIncomingExport(req, res, (response) => {
        logger.info({ event: 'Exited function', functionName: 'jazzcashIncomingExport in class excelExportController' });
        res.send(response);
      });
    
    } catch (error) {
        logger.error({ event: 'Error thrown', functionName: 'jazzcashIncomingExport in class excelExportController', 'error': { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, query: req.query });
        logger.info({ event: 'Exited function', functionName: 'jazzcashIncomingExport in class excelExportController' });
      return null;
    }
  }

  async jazzcashOutgoingExport(req, res) {
    logger.info({ event: 'Entered function', functionName: 'jazzcashOutgoingExport in class excelExportController', request: req.url, header: req.headers, query: req.query });
    try {

      this.ExcelExportService.jazzcashOutgoingExport(req, res, (response) => {
        logger.info({ event: 'Exited function', functionName: 'jazzcashOutgoingExport in class excelExportController' });
        res.send(response);
      });
    
    } catch (error) {
        logger.error({ event: 'Error thrown', functionName: 'jazzcashOutgoingExport in class excelExportController', 'error': { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, query: req.query });
        logger.info({ event: 'Exited function', functionName: 'jazzcashOutgoingExport in class excelExportController' });
        return null;
    }
  }

}
export default new excelExportController(ExcelExportService);
