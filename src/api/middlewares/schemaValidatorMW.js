import Schema from '../../util/schema';
import path from 'path';
const swaggerPath = `${path.dirname(__dirname)}/../definitions/AccountAndTaxStatement.yml`; //Should have Definitions Section
const schemaValidatorMW = (req, res, next) => {
    const schema = new Schema(swaggerPath);
    res.statusCode = null;
    const result = schema.validate(req, res, next);

    if (result.success) {
        next();
    } else {
        res.status(result.error.statusCode || 500).json({ message: result.error.message, errors: result.error.errors });
    }
};

export default schemaValidatorMW;