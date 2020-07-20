import Controller from './controller';
import CustomerService from '../../services/customerService';
import Customer from '../../model/customer';
import imageUploader from '../../util/imageHandler';

const customerService = new CustomerService(new Customer().getInstance());

class CustomerController extends Controller {
    constructor(service) {
        super(service);
    }

    async uploadImage(req, res) {

        const imagePath = imageDIR;
        const size = {
            width: 1240,
            height: 720,
        };



        //Add validation in AJV schema validation
        if (!req.file) {
            res.status(401).json({
                error: 'Please provide an image',
            });
        }


        const fileUpload = new imageUploader(imagePath, size);
        const filename = await fileUpload.save(req.file.buffer);



        return res.status(200).json({
            name: filename,
        });

    }
}

export default new CustomerController(customerService);