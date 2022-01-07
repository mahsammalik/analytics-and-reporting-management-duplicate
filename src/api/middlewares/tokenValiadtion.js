import logger  from '../../util/logger';
import mappedMetaData  from '../../util/mapMetaData';

const isTokenValidation= process.env.Token_Validation || 'false';

const isTokenValid = (req,res,next) =>
{

    try {
        logger.debug("Entered Token Validation MW");
        let auth = req.get('Authorization');
        if(auth){
            logger.debug("Entered Authorization Flow");
            let metadatamsisdn = req.get('x-user-metadata');
            let msisdn= req.get('X-MSISDN');
            const metadatamap = mappedMetaData(metadatamsisdn && metadatamsisdn != 'null' ? metadatamsisdn : false);
            let metadata = JSON.parse(metadatamsisdn);
            if (isTokenValidation == 'false'|| !msisdn ) 
            { 
                return next();
            }
            if (metadata.a == msisdn) 
            {
                return next();
            }
            else 
            {
                res.status(403).send({ success: false, message: `Your Bearer Token is not valid again Msisdn [${msisdn}] .`, });
                return;
            }
        }else{
            return next();
        }
    }
    catch (error)
    {
        logger.error(error);
    }
next();
}

export default isTokenValid;
