import fs from "fs";
import pdf from 'html-pdf';
import logger from './logger';

const options = { format: 'A4', orientation: 'portrait', type: 'pdf', timeout: '10000000'};

const createPDF = async(templateDetails) => {
    try {
        //Comment	for testing HTML Template
        // const fileName = `${__dirname}/../public/${templateDetails.fileName}`;
        // fs.writeFile(`${fileName}.html`, templateDetails.template, (err, data) => {
        //     if (err) throw err;
        //     logger.debug('html created');
        //     pdf.create(templateDetails.template, options).toFile(`${fileName}.pdf`, (err, res) => {
        //         if (err) return err;
        //         logger.debug(res);
        //         return res;
        //     });
        // });

        logger.info({ event: 'Entered function', functionName: 'createPDF', html: templateDetails.template });
        return new Promise((resolve, reject) => {
            pdf.create(templateDetails.template, options).toBuffer((err, buffer) => {
                if (err) {
                    console.log('PDF Error', err);
                    reject(err);
                } else {
                    console.log('PDF Buffer', buffer);
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