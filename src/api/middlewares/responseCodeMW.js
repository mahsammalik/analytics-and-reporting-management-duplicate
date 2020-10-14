import { logger, responseCodeHandler } from '/util/';

/**
 * * Send response based on response code from controller input  {locals.reponse}
 * @param {*} req,res,next
 * @return response from response code
 * TODO: Check for language param in request and send response in english/urdu
 */
const responseCodeMW = async(req, res, next) => {
    try {
        logger.info({ event: 'Entered function', functionName: 'responseCodeMW' });
        if (res.locals.response) {
            const response = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.success, "");
            res.locals.response = response;
            res.status(200).json(response);
        } else {
            const response = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.email_problem, "");
            res.locals.response = response;
            res.status(422).send(response);
        }
        logger.info({ event: 'Exited function', functionName: 'responseCodeMW' });

    } catch (error) {

        logger.error({ event: 'Exited function', functionName: 'responseCodeMW', error: { message: error.message, stack: error.stack }, request: req.url, headers: req.headers, response: res.locals.response });
        logger.info({ event: 'Exited function', functionName: 'responseCodeMW' });
        throw new Error(error);
    }

};

export default responseCodeMW;