import logger from './logger';
import axios from 'axios';
import {
    isNull
} from 'lodash';


const NOTIFICATION_SERVICE_URL_PUSH = process.env.NOTIFICATION_SERVICE_URL_PUSH || config.externalServices.NotificationService.pushNotificationUrl;
const NOTIFICATION_SERVICE_URL_EMAIL = process.env.NOTIFICATION_SERVICE_URL_EMAIL || config.externalServices.NotificationService.emailNotificationUrl;
const NOTIFICATION_SERVICE_URL_SMS = process.env.NOTIFICATION_SERVICE_URL_SMS || config.externalServices.NotificationService.smsNotificationUrl;


class Notification {

    async sendPushNotification(PushID, DeviceType, MessageTitle, MessageBody) {
        try {
            logger.info({ event: 'Entered function', functionName: 'sendPushNotification in class Notification' });
            let pushNotificationReqBody = {
                pushID: PushID,
                deviceType: DeviceType,
                payload: {
                    notification: {
                        title: MessageTitle,
                        body: MessageBody,
                    },
                },
                data: {
                    title: MessageTitle,
                    body: MessageBody,
                },
            };
            logger.info({ event: 'Exited function', functionName: 'sendPushNotification in class Notification' });

            return await axios
                .post(
                    NOTIFICATION_SERVICE_URL_PUSH,
                    pushNotificationReqBody
                )
                .then((response) => {
                    // console.log(response);
                    return true;
                })
                .catch((error) => {
                    logger.error({ event: 'Error thrown ', functionName: 'NOTIFICATION_SERVICE_URL_PUSH in class Notification', error, arguments: { PushID, DeviceType, MessageTitle, MessageBody } });
                    logger.info({ event: 'Exited function', functionName: 'NOTIFICATION_SERVICE_URL_PUSH in class Notification' });

                    return false;
                });

        } catch (error) {

            logger.error({ event: 'Error thrown ', functionName: 'sendPushNotification in class Notification', error, arguments: { PushID, DeviceType, MessageTitle, MessageBody } });
            logger.info({ event: 'Exited function', functionName: 'sendPushNotification in class Notification' });
            return false;
            // throw new Error(error);
        }
    }

    //added by kashif abbasi dated 27-Jul-2020
    async sendEmail(To, Subject, HTML, Attachments, Template, Data) {
        try {
            logger.info({ event: 'Entered function', functionName: 'sendEmail in class Notification' });
            //Attachmet should be array
            //1- if file present on disk than having two properties like this Attachments: [{"path": 'ww.googl.com/image.jpg', "embedImage": true}]
            //2- if file is in binary or base64 format than having 4 properties like this Attachments: [{"fileName": "test.png", content: "kjkjjhj", type:"base64", "embedImage": true}]

            let emailReqBody = {
                // Move from email to env variables
                // from: 'no-reply@JazzCash.com.pk',
                to: To,
                subject: Subject,
                html: HTML,
            };

            if (!isNull(Attachments)) {
                emailReqBody.attachments = Attachments;
            }

            /*if template is already defined then HTML would be overwritten with this template
              Data: is an array of key value , which replace the keys in template, formate of Data should be , data: [{key: "customeName",value: "kashif"}]
            */
            if (!isNull(Template) && Template != "") {
                emailReqBody.template = Template;
                emailReqBody.data = Data;
            }
            // console.log('printing email');
            // console.log(emailReqBody);
            return await axios
                .post(NOTIFICATION_SERVICE_URL_EMAIL, emailReqBody)
                .then((response) => {
                    console.log('Email Sent', response);
                    return true;
                })
                .catch((error) => {
                    logger.error({ event: 'Error thrown ', functionName: 'NOTIFICATION_SERVICE_URL_EMAIL in class Notification', error: { message: error.message, stack: error.stack }, arguments: { To, Subject, HTML, } });
                    logger.info({ event: 'Exited function', functionName: 'NOTIFICATION_SERVICE_URL_EMAIL in class Notification' });

                    throw new Error(error);
                });

        } catch (error) {
            logger.error({ event: 'Error thrown ', functionName: 'sendEmail in class Notification', error: { message: error.message, stack: error.stack }, arguments: { To, Subject, HTML, } });
            logger.info({ event: 'Exited function', functionName: 'sendEmail in class Notification' });

            throw new Error(error);
        }
    }
}
export default new Notification();