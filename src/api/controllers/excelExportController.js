import ExcelExportService from '../../services/excelExportService';
import _ from 'lodash';
import logger from '../../util/logger';
import responseCodeHandler from '../../util/responseCodeHandler';

class excelExportController {
  constructor(service) {
    this.ExcelExportService = service;

    this.jazzcashIncomingExport = this.jazzcashIncomingExport.bind(this);
    this.jazzcashOutgoingExport = this.jazzcashOutgoingExport.bind(this);
  }

  async jazzcashIncomingExport(req, res) {
    logger.info({ event: 'Entered function', functionName: 'jazzcashIncomingExport in class excelExportController', request: req.url, header: req.headers, query: req.query });
    let clientResponse = {};
    try {
      this.ExcelExportService.jazzcashIncomingExport(req, res, (response) => {
        logger.info({ event: 'Exited function', functionName: 'jazzcashIncomingExport in class excelExportController' });
        res.send(response);
      });

    } catch (error) {
        logger.error({ event: 'Error thrown', functionName: 'jazzcashIncomingExport in class excelExportController', 'error': { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, query: req.query });
        logger.info({ event: 'Exited function', functionName: 'jazzcashIncomingExport in class excelExportController' });
        clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
        return res.status(200).send(this.getResponse(clientResponse));
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
        clientResponse = await responseCodeHandler.getResponseCode(config.responseCode.useCases.easyPaisaIBFT.internal, "");
        return res.status(200).send(this.getResponse(clientResponse));
    }
  }

  getResponse(responsePayload) {
    logger.debug('_______________ Get Response Called ________________');
    logger.debug(responsePayload);

    try {
      let updatedResponse = {};
    
      if (responsePayload.success) {
        updatedResponse = _.omit(responsePayload, ['message_ur', 'responseCode']);
      } else {
        updatedResponse = _.omit(responsePayload, [ 'message_ur', 'data', 'responseCode']);
      }
      return updatedResponse;

    } catch(error) {
      logger.debug(error);
      return {
        "success":false,
        "message_en": "System internal server error"
      }
    }
  }

}
export default new excelExportController(ExcelExportService);
