// import fs from "fs";
import pdf from 'html-pdf';
const options = { format: 'A4', orientation: 'portrait', type: 'pdf', };

const createPDF = async(templateDetails) => {
    try {

        // const fileName = `${__dirname}/../public/${templateDetails.fileName}`;
        //Comment	for testing HTML Template
        // fs.writeFile(`${fileName}.html`, templateDetails.template, (err, data) => {
        //     if (err) throw err;
        //     console.log('html created');
        //     pdf.create(templateDetails.template, options).toFile(`${fileName}.pdf`, (err, res) => {
        //         if (err) return err;
        //         console.log(res);
        //         return res;
        //     });
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