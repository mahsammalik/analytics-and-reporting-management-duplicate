import responseCodeHandler from '../../util/responseCodeHandler';
/**
 * * Send response based on response code from controller input  {locals.reponse}
 * @param {*} req,res,next
 * @return response from response code
 * TODO: Check for language param in request and send response in english/urdu
 */
const responseCodeMW = async(req, res, next) => {
    try {
        if (res.locals.response) {
            const response = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.success, "");
            res.locals.response = response;
            res.status(200).json(response);
        } else {
            const response = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.email_problem, "");
            res.locals.response = response;
            res.status(422).send(response);
        }
        next();
    } catch (error) {
        logger.error(error);
    }

};

export default responseCodeMW;