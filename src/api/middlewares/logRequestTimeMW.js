const logRequestTimeMW = (req, res, next) => {
    req.requestTime = Date.now();
    next();
};

export default {
    logRequestTimeMW
};