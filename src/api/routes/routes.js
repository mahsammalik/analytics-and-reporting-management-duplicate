import CustomerController from '../controllers/customerController';
import upload from '../middlewares/uploadMiddleware';
import accountStatementController from '../controllers/AccountStatementController';
import accountStatementService from '../../services/AccountStatementService';

export default (app) => {

  // POST ROUTES
  // server.get(`/api/post`, PostController.getAll);

  app.get('rest/api/v1/reports/statement/account', async function (req, res) {
    console.log('call the route');
    if(req.query.start_date == undefined) res.status(404).json('Missing Start Date');
    if(req.query.end_date == undefined) res.status(404).json('Missing End Date');
    if(req.query.msisdn == undefined) res.status(404).json('Missing user\'s mobile number');
    if(req.query.request !== 'Email' || req.query.request !== 'Download' ) res.status(404)
    .send('Please send the request with either Download or Email requirement');
    if(req.query.request == undefined) res.status(404).json('Missing request requirement');
    accountStatementController.calculateAccountStatement(req, res);
  });
  
  // app.post(`/api/post`, CustomerController.insert);
  //server.put(`/api/post/:id`, PostController.update);
  //server.delete(`/api/post/:id`, PostController.delete);

  //upload Image sample
  // app.post('/postimage', upload.single('file'), CustomerController.uploadImage);




};