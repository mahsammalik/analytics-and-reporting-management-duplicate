import logger from './util/logger';
global.logger = logger;
// const = require('pdfkit');
import express from 'express';
import bodyParser from 'body-parser';
import routes from './api/routes/routes';
import middleware from './api/middlewares/testMiddleware';
import Cache from './util/cache';
import Subscriber from './services/subscriberService';
import path from 'path';
import { extract } from './extract';
import accountStatementService from './services/accountStatementService';

console.log('printing webserver value' + config.mongodb.host);
logger.info('Trace message, Winston!');

const app = express();
app.use(middleware.logRequestTime);
app.use(bodyParser.json());


// Temporary Image Repsoitory for storing images : Need to change on test/prod env
const imagePath = path.join(__dirname, '../public/pdf/');
global.imageDIR = imagePath;
app.use(express.static(imagePath));
// app.use('/', routes);

// ********* SAMPLE CODE TESTING
const subscriber = new Subscriber();
subscriber.setConsumer();

app.get('/put', async (req, res) => {
  logger.info(req.logRequestTime);
  await Cache.putValue('jk', 'final count', config.cache.cacheName);
  res.send('value inserted in the data cache');
 
});

app.get('/get', async (req, res) => {
  //  let value = await Cache.getValue('jk', config.cache.cacheName);
  // res.send('value fetched from value' + value); logger.info(req.logRequestTime);
  res.json(accountStatementService.sendEmailCSV_Format)


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



