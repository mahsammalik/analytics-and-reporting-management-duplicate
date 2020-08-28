import logger from './logger';
import axios from 'axios';
import {
    isNull
} from 'lodash';

class Notification {
    constructor() {}

    async sendPushNotification(PushID, DeviceType, MessageTitle, MessageBody) {
        try {
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

            let Response = await axios
                .post(
                    config.NotificationService.pushNotificationUrl,
                    pushNotificationReqBody
                )
                .then((response) => {
                    console.log(response);
                    return true;
                })
                .catch((error) => {
                    console.log(error);
                    return false;
                });
            return true;
        } catch (error) {
            logger.error(
                'Error in Notification.sendPushNotification from accountmanagement microservice' +
                error
            );
            return false;
        }
    }

    //added by kashif abbasi dated 27-Jul-2020
    async sendEmail(To, Subject, HTML, Attachments, Template, Data) {
        try {
            //Attachmet should be array
            //1- if file present on disk than having two properties like this Attachments: [{"path": 'ww.googl.com/image.jpg', "embedImage": true}]
            //2- if file is in binary or base64 format than having 4 properties like this Attachments: [{"fileName": "test.png", content: "kjkjjhj", type:"base64", "embedImage": true}]
            console.log('in sendEmail');
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
            console.log('printing email');
            console.log(emailReqBody);
            let Response = await axios
                .post(config.NotificationService.emailNotificationUrl, emailReqBody)
                .then((response) => {
                    console.log(response);
                    return true;
                })
                .catch((error) => {
                    console.log(error);
                    return false;
                });
            return true;
        } catch (error) {
            logger.error(
                'Error in Notification.sendEmail from accountmanagement microservice' + error
            );
            return false;
        }
    }
}
export default new Notification();