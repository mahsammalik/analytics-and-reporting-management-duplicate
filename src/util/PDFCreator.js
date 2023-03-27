import fs from "fs";
import pdf from 'html-pdf';
import logger from './logger';

const options = { format: 'A4', orientation: 'portrait', type: 'pdf', timeout: '600000'};

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

        console.log("templateDetails ========================>",templateDetails)
        console.log("stringify templateDetails ========================>",JSON.stringify(templateDetails))
        logger.info({ event: 'Entered function', functionName: 'createPDF' });
        logger.info({ event: 'Exited function', functionName: 'createPDF' });
        return new Promise((resolve, reject) => {
            pdf.create(templateDetails.template, options).toBuffer((err, buffer) => {
                console.log("INSIDE CREATE PDF")
                if (err) {
                    console.log("REJECTED")
                    reject(err);
                } else {
                    console.log("RESOLVED")
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