import logger from './util/logger';
global.logger = logger;
const PDFDocument = require('pdfkit');
const fs = require('fs');

import express from 'express';
import bodyParser from 'body-parser';
import dbConnection from './util/dbConnection';
import routes from './api/routes/routes';
import middleware from './api/middlewares/testMiddleware';
import Cache from './util/cache';
import Subscriber from './services/subscriberService';
import path from 'path';
import responseCodeHdler from './util/responseCodeHandler';
import DatabaseConn from './util/responseCodeHandler';
import DB2_Connection from './util/DB2Connection';
import EmailHandler from './util/EmailHandler';
const { Base64Encode } = require('base64-stream');

console.log('printing webserver value' + config.mongodb.host);
logger.info('Trace message, Winston!');

const app = express();
app.use(middleware.logRequestTime);
app.use(bodyParser.json());


// Temporary Image Repsoitory for storing images : Need to change on test/prod env
const imagePath = path.join(__dirname, '../public/pdf/');
global.imageDIR = imagePath;
app.use(express.static(imagePath));



// ********* SAMPLE CODE TESTING
const subscriber = new Subscriber();
subscriber.setConsumer();
app.get('/', async (req, res) => {
  const dump = await DB2_Connection.getValue('1030', '2020-10-01', '2020-02-01');
  console.log("return " + dump);
  res.send(dump);

});

app.get('/generatePDF', async function (req, res) {
  var myDoc = new PDFDocument({ bufferPages: true });
  var finalString = ''; // contains the base64 string
    let buffers = [];
    const data = await DB2_Connection.getValue('1030', '2020-10-01', '2020-02-01');
    if (req.query.request == 'Download') {
      var myDoc = new PDFDocument({ bufferPages: true });

    myDoc.on('data', buffers.push.bind(buffers));
    myDoc.on('end', () => {
       let pdfData = Buffer.concat(buffers);
       res.writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-disposition': 'attachment;filename=output.pdf',
      })
        .end(pdfData);
    });
  }else if (req.query.request == 'Email'){
    myDoc.pipe(new Base64Encode());
    myDoc.on('data', function(chunk) {
      finalString += chunk;
  });
  
  myDoc.on('end', function() {
      // the stream is at its end, so push the resulting base64 string to the response
      EmailHandler.sendEmail("","", '', finalString);
      res.json("the mail send succesful");
  });
  }
 
    myDoc.font('Times-Roman')
      .fontSize(12)
      .text(data);
    myDoc.end();
  
});



app.get('/getResponse', async (req, res) => {
  res.sendFile( path.resolve(imageDIR+ 'output12.pdf'), {
    'Content-Length': Buffer.byteLength(pdfData),
    'Content-Type': 'application/pdf',
    'Content-disposition': 'attachment;filename='+imageDIR + 'output'+ 12 + '.pdf',
  });
  // logger.info(req.logRequestTime);
  // responseCodeHdler.getResponseCode("ab-T12");
  // res.send('Response Code Handler Called');

});

app.get('/put', async (req, res) => {
  logger.info(req.logRequestTime);
  await Cache.putValue('jk', 'final count', config.cache.cacheName);
  res.send('value inserted in the data cache');

});


app.get('/get', async (req, res) => {
  logger.info(req.logRequestTime);
  let value = await Cache.getValue('jk', config.cache.cacheName);
  res.send('value fetched from value' + value);

});

app.get('/testEndPoint', async (req, res) => {
  logger.info(req.logRequestTime);
  res.status(200).send('Testing End Point for appsody test');

});


app.get('/produceinit', async (req, res) => {
  logger.info(req.logRequestTime);
  await subscriber.event.produceMessage("hello init", "initTopic");
  res.send('messages produced to Init Topic Kafka');

});

app.get('/produceconfirm', async (req, res) => {
  logger.info(req.logRequestTime);
  await subscriber.event.produceMessage("hello confirm", "confirmTopic");
  res.send('messages produced to Confirm Topic Kafka');

});

// ********* SAMPLE CODE TESTING

routes(app);

module.exports.app = app;