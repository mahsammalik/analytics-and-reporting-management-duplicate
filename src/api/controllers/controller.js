import validations from './validators/validationEnhanced';
import schema from './validators/schema.json';

class Controller {
  constructor(service) {
    this.service = service;
    this.getAll = this.getAll.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll(req, res) {
    return res.status(200).send(await this.service.getAll(req.query));
  }

  async insert(req, res) {
    /// FOR VALIDATIONS

    //if(request contains file object then add to body for validation)
    if (req.file) {
      req.body.file = req.file;
    }

    const validationResponse = validations.verifySchema(
      "EMAIL_SCHEMA",
      req.body
    );
    if (!validationResponse.success) {
      //const extendedMessage = " Reason: " + validationResponse.message.toString();
      return res.status(201).send(validationResponse.message);
    }

    let response = await this.service.insert(req.body);
    if (response.error) return res.status(response.statusCode).send(response);
    return res.status(201).send(response);
  }

  async update(req, res) {
    const {
      id
    } = req.params;


    //if(request contains file object then add to body for validation)
    if (req.file) {
      req.body.file = req.file;
    }

    let response = await this.service.update(id, req.body);

    return res.status(response.statusCode).send(response);
  }

  async delete(req, res) {
    const {
      id
    } = req.params;

    let response = await this.service.delete(id);

    return res.status(response.statusCode).send(response);
  }
}

export default Controller;