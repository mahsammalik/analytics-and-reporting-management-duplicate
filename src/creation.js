import DB2_Connection from './util/DB2Connection';
import EmailHandler from './util/EmailHandler';
import { downloadProcess } from './services/AccountStatement';
const { Base64Encode } = require('base64-stream');
export async function creation(req, myDoc, buffers, res, finalString) {
  const data = await DB2_Connection.getValue('1030', '2020-10-01', '2020-02-01');
  let pdfData;

  if (req.query.request == 'Download') {
    ({ myDoc, pdfData } = downloadProcess(myDoc, buffers, pdfData, res));
  }
  else if (req.query.request == 'Email') {
    myDoc.pipe(new Base64Encode());
    myDoc.on('data', function (chunk) {
      finalString += chunk;
    });

    myDoc.on('end', function () {
      // the stream is at its end, so push the resulting base64 string to the response
      EmailHandler.sendEmail("", "", '', finalString);
      res.json("the mail send to push ");
    });
  }
  myDoc.font('Times-Roman')
    .fontSize(12)
    .text(data);
  myDoc.end();
  return finalString;
}
