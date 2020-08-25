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
import taxStatementService from './services/taxStatementService';

console.log('printing webserver value' + config.mongodb.host);
logger.info('Trace message, Winston!');

const app = express();
app.use(middleware.logRequestTime);
app.use(bodyParser.json());


// Temporary Image Repsoitory for storing images : Need to change on test/prod env
const imagePath = path.join(__dirname, '../public/pdf/');
const pdfPath = path.join(__dirname, '../public/');
global.imageDIR = imagePath;
global.pdfDIR = pdfPath;

app.use(express.static(imagePath));
app.use(express.static(pdfPath));


// app.use('/', routes);

// ********* SAMPLE CODE TESTING
const subscriber = new Subscriber();
subscriber.setConsumer();
let ejs = require("ejs");
let pdf = require("html-pdf");
let students = [
  {name: "Joy",
   email: "joy@example.com",
   city: "New York",
   country: "USA"},
  {name: "John",
   email: "John@example.com",
   city: "San Francisco",
   country: "USA"},
  {name: "Clark",
   email: "Clark@example.com",
   city: "Seattle",
   country: "USA"},
  {name: "Watson",
   email: "Watson@example.com",
   city: "Boston",
   country: "USA"},
  {name: "Tony",
   email: "Tony@example.com",
   city: "Los Angels",
   country: "USA"
}];
app.get('/put', async (req, res) => {
  logger.info(req.logRequestTime);
  await Cache.putValue('jk', 'final count', config.cache.cacheName);
  res.send('value inserted in the data cache');
 
});

app.get('/populate_database', async (req, res) => {
  //  let value = await Cache.getValue('jk', config.cache.cacheName);
  // res.send('value fetched from value' + value); logger.info(req.logRequestTime);
  await accountStatementService.populateDataBase();
  res.json("done")

});
app.get("/generateReport", (req, res) => {
	ejs.renderFile(path.join(imageDIR,"report-template.ejs"), {
        students: students
    }, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            
            pdf.create(data).toFile(imageDIR+"report.pdf", function (err, data) {
                if (err) {
                    res.send(err);
                } else {
                    res.send("File created successfully");
                }
            });
        }
    });
})
app.get('/test_pdf', async (req, res) => {
  //  let value = await Cache.getValue('jk', config.cache.cacheName);
  // res.send('value fetched from value' + value); logger.info(req.logRequestTime);
  accountStatementService.test();


});
app.get('/populate/tax', async (req, res) => {
  //  let value = await Cache.getValue('jk', config.cache.cacheName);
  // res.send('value fetched from value' + value); logger.info(req.logRequestTime);
  await accountStatementService.testPackage();
  res.json("done")


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



