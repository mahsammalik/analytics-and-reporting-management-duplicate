import logger from './logger';


const constMetadata = {
    a: 923219272700,
    b: 3740532989703,
    c: 0,
    d: "abc@xyz.com",
    e: "waqas",
    f: "burney",
    g: "/test.png",
    h: 1,
    i: 1,
    j: 1232008,
    k: 1
};
const mappedMetaData = (metadata) => {
    try {
        logger.info({ event: 'inside function', function: 'mappedMetadata', metadata });
        const parsedMetadata = metadata ? JSON.parse(metadata) : constMetadata;
        // logger.debug(parsedMetaData);
        logger.debug({ parsedMetadata });

        Object.keys(parsedMetadata).map((key) => {

            parsedMetadata[config.metadata.mapping[key]] = config.metadata[config.metadata.mapping[key]] ? config.metadata[config.metadata.mapping[key]][parsedMetadata[key]] : parsedMetadata[key];
            delete parsedMetadata[key];

        });
        return parsedMetadata;
    } catch (error) {
        return false;
    }



};

export default mappedMetaData;