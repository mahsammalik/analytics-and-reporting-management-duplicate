import logger from './util/logger';
global.logger = logger;

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
import DB2_Connection from './util/DB2_Connection';
console.log('printing webserver value' + config.mongodb.host);
logger.info('Trace message, Winston!');

const app = express();
app.use(middleware.logRequestTime);
app.use(bodyParser.json());


// Temporary Image Repsoitory for storing images : Need to change on test/prod env
const imagePath = path.join(__dirname, '../public/images/registrations/');
global.imageDIR = imagePath;
app.use(express.static(imagePath));



// ********* SAMPLE CODE TESTING
const subscriber = new Subscriber();
subscriber.setConsumer();
const db2 = new DatabaseConn();
app.get('/', async (req, res) => {
  
  res.send(' Applicatoin Listening on host 3000');

});

app.get('/getResponse', async (req, res) => {
  logger.info(req.logRequestTime);
  responseCodeHdler.getResponseCode("ab-T12");
  res.send('Response Code Handler Called');

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