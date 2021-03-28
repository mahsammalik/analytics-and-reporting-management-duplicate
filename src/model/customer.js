import mongoose, {
  Schema
} from "mongoose";
//import uniqueValidator from "mongoose-unique-validator";
//import slugify from 'slugify';

class Customer {

  initSchema() {
    const schema = new Schema({
      firstName: {
        type: String,
        required: true,
      },
      slug: String,
      lastName: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      cellNo: {
        type: Number,
        required: false,
      }
    }, {
      timestamps: true
    });
    // schema.pre(
    //   "save",
    //   function (next) {
    //     let post = this;
    //     if (!post.isModified("title")) {
    //       return next();
    //     }
    //     post.slug = slugify(post.title, "_");
    //     logger.debug('set slug', post.slug);
    //     return next();
    //   },
    //   function (err) {
    //     next(err);
    //   }
    // );
    // schema.plugin(uniqueValidator);
    mongoose.model("Customer", schema);
  }

  getInstance() {
    this.initSchema();
    return mongoose.model("Customer");
  }
}

export default Customer;