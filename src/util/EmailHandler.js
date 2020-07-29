import axios from 'axios';

class EmailHandler {
	constructor(folder, size) {
	  this.folder = folder;
	  this.size = size;
	}
  
 async sendEmail(From, To,Subject,HTML,Attachments) {
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
	
      
	  let Response = await axios
        .post(config.NotificationService.pushNotificationUrl, emailReqBody)
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
      logger.error('Error in utility.sendEmail from accountmanagement microservice' + error);
      return false;
    }
  }

}

export default new EmailHandler();