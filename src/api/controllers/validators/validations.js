import _ajv from 'ajv';
import _ from 'lodash';

const verifySchema = (Schema, requestedJSON) => {
  let result = {};
  const ajv = _ajv({
    allErrors: true,
  });
  try {
    const validate = ajv.compile(Schema);
    const valid = validate(requestedJSON);
    if (!valid) {
      console.log('requested JSON is INVALID!');
      console.log(validate.errors);
      console.log(
        _.map(validate.errors, function (er) {
          return er.message;
        })
      );
      // eslint-disable-next-line max-len
      result = {
        success: false,
        message: _.map(validate.errors, function (er) {
          return er.message;
        }),
      };
    } else {
      result = {
        success: true,
        message: 'requested JSON is valid',
      };
    }
  } catch (err) {
    result = {
      success: false,
      message: err,
    };
  }
  return result;
};

export default { verifySchema };
