import mongoose from 'mongoose';
import logger from './logger';

const connectionString = process.env.MONGO_CONNECTION || config.mongodb.connectionString;


class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    logger.info('ConnectionString' + connectionString)
    mongoose
      .connect(connectionString)
      .then(() => {
        logger.debug({event:'Database connection successful'});
      })
      .catch((err) => {
        logger.error({event:'Error Thrown', err});
        logger.error({event:'Database connection error'});
      });
  }
}

export default new Database();