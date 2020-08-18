import axios from 'axios';
import responseCodeHandler from './responseCodeHandler';

class EmailHandler {
	constructor(folder, size) {
	  this.folder = folder;
	  this.size = size;
	}
  
 async sendEmail(From, To,Subject,HTML,Attachments, res) {
    try {
      //Attachmet should be array having two properties like this Attachments: [{"path": 'ww.googl.com/image.jpg', "embadImage": true}]
	  console.log("enter the service");	
	  let emailReqBody = {
        "from": (From!="") ? From : "no-reply@JazzCash.com.pk",
        "to": To,
        "subject": Subject,
        "html": HTML,
      };

      if(Attachments !== null){
        emailReqBody.attachments=Attachments;
	  }
	
    const responseCodeForSuccess  = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.success, "Email send successful");
    const responseCodeForError  = await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.email_problem, "Email service issue");

	  let Response = await axios
        .post(config.NotificationService.pushNotificationUrl, emailReqBody)
        .then((response) => {
          console.log(response);
          return res.status(200).send(responseCodeForSuccess);          
        })
        .catch((error) => {
          console.log("Error in email service"+ error);
          return res.status(422).send(responseCodeForError);          
        });     
    } catch (error) {
      logger.error('Error in utility.sendEmail from accountmanagement microservice' + error);
      return res.status(422).send(responseCodeForError);          
    }
  }

}

export default new EmailHandler();