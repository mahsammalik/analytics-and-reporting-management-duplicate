// import fs from "fs";
const fs = require('fs').promises;
import pdf from 'html-pdf';
const options = { format: 'A4', orientation: 'portrait', type: 'pdf', };

const createPDF = async(templateDetails, callback) => {
    try {

        // const fileName = `${__dirname}/../public/${templateDetails.fileName}`;
        //Comment	for testing HTML Template
        // fs.writeFile(`${fileName}.html`, templateDetails.template, (err, data) => {
        //     if (err) throw err;
        //     console.log('html created');
        // });

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
        logger.error(error);
        return new Error("PDF creation error");
    }

};

export default createPDF;;