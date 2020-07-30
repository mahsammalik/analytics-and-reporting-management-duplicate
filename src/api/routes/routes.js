import CustomerController from '../controllers/customerController';
import upload from '../middlewares/uploadMiddleware';

export default (app) => {

  // POST ROUTES
  // server.get(`/api/post`, PostController.getAll);
 /**
 * @swagger
 * /:
 *  get:
 *    description: Use to request all customers
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.post(`/api/post`, CustomerController.insert);
  //server.put(`/api/post/:id`, PostController.update);
  //server.delete(`/api/post/:id`, PostController.delete);

  //upload Image sample
  app.post('/postimage', upload.single('file'), CustomerController.uploadImage);




};