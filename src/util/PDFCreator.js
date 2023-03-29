import fs from "fs";
import pdf from 'html-pdf';
import logger from './logger';

const options = { format: 'A4', orientation: 'portrait', type: 'pdf', timeout: '600000'};

const createPDF = async(templateDetails, cb) => {
    try {

        logger.info({ event: 'Entered function', functionName: 'createPDF', data: templateDetails.template });
        return new Promise((resolve, reject) => {
            pdf.create(templateDetails.template, options).toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer);
                }
            });
        });
        
    } catch (error) {
        logger.error({ event: 'Error throw', functionName: 'createPDF', error: { message: error.message, stack: error.stack } });
        logger.info({ event: 'Exited function', functionName: 'createPDF' });
        return new Error("PDF creation error");
    }

};

export default createPDF;;