import logger from './logger';
import axios from 'axios';
import {
    isNull
} from 'lodash';
import Subscriber from '../services/subscriberService'


const NOTIFICATION_SERVICE_URL_PUSH = process.env.NOTIFICATION_SERVICE_URL_PUSH || config.externalServices.NotificationService.pushNotificationUrl;
const NOTIFICATION_SERVICE_URL_EMAIL = process.env.NOTIFICATION_SERVICE_URL_EMAIL || config.externalServices.NotificationService.emailNotificationUrl;
const NOTIFICATION_SERVICE_URL_SMS = process.env.NOTIFICATION_SERVICE_URL_SMS || config.externalServices.NotificationService.smsNotificationUrl;


class Notification {
    constructor(){
        this.subscriber = Subscriber.getInstance();
    }

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
                    // logger.debug(response);
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
            // logger.debug('printing email');
            // logger.debug(emailReqBody);
            // axios
            // .post(
                
            //     NOTIFICATION_SERVICE_URL_EMAIL, emailReqBody)
            return await axios({
                method: 'post',
                url: NOTIFICATION_SERVICE_URL_EMAIL,
                data: emailReqBody,
                maxContentLength: 'Infinity',
                maxBodyLength: 'Infinity'
            }).then((response) => {
                logger.debug('Email Sent', response);
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

      //added by mahsam dated 05-Dec-2022
    async sendPushNotificationKafka(PushID, DeviceType, templateName, templateData, otherData) {
        try {
            const kafkaPayload = {
                pushID: PushID,
                deviceType: DeviceType,
                payload: {
                    notification: {
                        template: templateName,
                        templateData: templateData,
                    },
                    data: otherData
                },
            };

            logger.info({
                event: 'Entered function',
                functionName: 'Notification.sendPushNotificationKafka',
                data: { body: kafkaPayload }
            });

            this.subscriber.event.produceMessage(kafkaPayload, config.kafkaBroker.topics.Notification_Push);

        } catch (error) {
            logger.error({
                event: 'Exited function with error',
                functionName: 'Notification.sendPushNotificationKafka',
                error: {
                    message: error && error.message ? error.message : "",
                    stack: error && error.stack ? error.stack : ""
                },
            });
            return false;
        }
    }

    //added by mahsam dated 05-Dec-2022
    async sendSMSKafka(msisdn, customerType, templateName, data) {
        try {

            let kafkaPayload = {
                msisdn: msisdn,
                customerType: customerType,
                template: templateName,
            };

            if (!isNull(data))
                kafkaPayload.data = data;
            else
                kafkaPayload.data = [];


            logger.info({
                event: 'Entered function',
                functionName: 'Notification.sendSMSKafka',
                data: { body: kafkaPayload }
            });

            this.subscriber.event.produceMessage(kafkaPayload, config.kafkaBroker.topics.Notification_Sms);

            return true;
        } catch (error) {
            logger.error({
                event: 'Exited function with error',
                functionName: 'Notification.sendSMSKafka',
                error: {
                    message: error && error.message ? error.message : "",
                    stack: error && error.stack ? error.stack : ""
                },
            });
            return false;
        }
    }

    //added by mahsam dated 05-Dec-2022
    async sendPushNotificationByMSISDNKafka(msisdn, customerType, templateName, templateData, otherData) {
        try {
            if (otherData == null)
                otherData = {};
            if (templateData == null)
                templateData = [];

            let kafkaPayload = {
                msisdn: msisdn,
                customerType: customerType,
                payload: {
                    notification: {
                        template: templateName,
                        templateData: templateData,
                    },
                    data: otherData
                },

            };

            logger.info({
                event: 'Entered function',
                functionName: 'Notification.sendPushNotificationByMSISDNKafka',
                data: { body: kafkaPayload }
            });

            this.subscriber.event.produceMessage(kafkaPayload, config.kafkaBroker.topics.Notification_Push);


            return true;
        } catch (error) {
            logger.error({
                event: 'Exited function with error',
                functionName: 'Notification.sendPushNotificationByMSISDNKafka',
                error: {
                    message: error && error.message ? error.message : "",
                    stack: error && error.stack ? error.stack : ""
                },
            });
            return false;
        }
    }

    //added by mahsam dated 05-Dec-2022
    async sendEmailKafka(To, Subject, HTML, Attachments, Template, Data) {
        try {
            //Attachmet should be array
            //1- if file present on disk than having two properties like this Attachments: [{"path": 'ww.googl.com/image.jpg', "embedImage": true}]
            //2- if file is in binary or base64 format than having 4 properties like this Attachments: [{"fileName": "test.png", content: "kjkjjhj", type:"base64", "embedImage": true}]

            let kafkaPayload = {
                // Move from email to env variables
                //from: 'no-reply@JazzCash.com.pk',
                to: To,
                subject: Subject,
                html: HTML,
            };

            if (!isNull(Attachments)) {
                kafkaPayload.attachments = Attachments;
            }

            /*if template is already defined then HTML would be overwritten with this template
              Data: is an array of key value , which replace the keys in template, formate of Data should be , data: [{key: "customeName",value: "kashif"}]
            */
            if (!isNull(Template) && Template != "") {
                kafkaPayload.template = Template;
                kafkaPayload.data = Data;
            }

            logger.info({
                event: 'Entered function',
                functionName: 'Notification.sendEmailKafka',
                data: { body: kafkaPayload }
            });

            this.subscriber.event.produceMessage(kafkaPayload, config.kafkaBroker.topics.Notification_Email);

            return true;
        } catch (error) {
            logger.error({
                event: 'Exited function with error',
                functionName: 'Notification.sendEmailKafka',
                error: {
                    message: error && error.message ? error.message : "",
                    stack: error && error.stack ? error.stack : ""
                },
            });
            return false;
        }
    }
}
export default new Notification();