const requestLoggerMW = (req, res) => {
    try {

        const headers = res.getHeaders();

        const log = `\n\r Method:${req.method}\n\r URL:${req.url}\n\r Request Headers:${JSON.stringify(req.headers, null, 4)}\n\r Response:${JSON.stringify(res.locals.response, null, 4)}\n\r Response Time: ${headers['x-response-time']}\n\r `;
        logger.info(log);
    } catch (error) {
        logger.error(error);
    }
};

export default requestLoggerMW;