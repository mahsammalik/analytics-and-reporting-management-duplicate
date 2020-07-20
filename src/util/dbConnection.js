import mongoose from 'mongoose';

const server = process.env.MONGO_DB_HOST || config.mongodb.host;
const port = process.env.MONGO_DB_PORT || config.mongodb.port;
const database = process.env.MONGO_DB_DATABASE || config.mongodb.database;

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose
      .connect(`mongodb://${server}:${port}/${database}`)
      .then(() => {
        logger.info('Database connection successful');
      })
      .catch((err) => {
        logger.error(err);
        logger.error('Database connection error');
      });
  }
}

export default new Database();