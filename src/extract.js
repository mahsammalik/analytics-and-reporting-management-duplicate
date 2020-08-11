const PDFDocument = require('pdfkit');
import DB2_Connection from './util/DB2Connection';
import EmailHandler from './util/EmailHandler';
import { downloadProcess } from './downloadProcess';
const { Base64Encode } = require('base64-stream');

export async function extract(req, res) {
  if (req.query.start_date == undefined)
    res.status(404).json('Missing Start Date');
  if (req.query.end_date == undefined)
    res.status(404).json('Missing End Date');
  if (req.query.msisdn == undefined)
    res.status(404).json('Missing user\'s mobile number');
  if (req.query.request !== 'Email' || req.query.request !== 'Download')
    res.status(404)
      .send('Please send the request with either Download or Email requirement');
  if (req.query.request == undefined)
    res.status(404).json('Missing request requirement');

  var myDoc = new PDFDocument({ bufferPages: true });
  var finalString = ''; // contains the base64 string
  let buffers = [];
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
}
