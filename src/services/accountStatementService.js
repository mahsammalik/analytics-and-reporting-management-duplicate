const PDFDocument = require('pdfkit');
import DB2_Connection from '../util/DB2Connection';
import EmailHandler from '../util/EmailHandler';
const { Base64Encode } = require('base64-stream');

class accountStatementService {
	constructor(){
		this.sendEmailPDF_Format = this.sendEmailPDF_Format.bind(this);
	}


	async sendEmailPDF_Format(payLoad, res) {
		console.log("call teh account sstatement service");
		var myDoc = new PDFDocument({ bufferPages: true });
		var finalString = ''; // contains the base64 string
		let buffers = [];
		console.log("payload msisdn" + payLoad.msisdn)
		const data = await DB2_Connection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);
		console.log("the account statement"+ data);
		let pdfData;
		// console.log("the payload request"+ payLoad.request)
		// if (payLoad.request == 'Download') {
		// 	console.log("Start Download Process");
		// 	myDoc = new PDFDocument({ bufferPages: true });
		// myDoc.on('data', buffers.push.bind(buffers));
		// myDoc.on('end', () => {
		// 	pdfData = Buffer.concat(buffers);
		// 	res.writeHead(200, {
		// 		'Content-Length': Buffer.byteLength(pdfData),
		// 		'Content-Type': 'application/pdf',
		// 		'Content-disposition': 'attachment;filename=Account.pdf',
		// 	})
		// 		.end(pdfData);
		// });
		// }
		// else if (payLoad.request == 'Email') {
			myDoc.pipe(new Base64Encode());
				myDoc.on('data', function (chunk) {
					finalString += chunk;
				});
			myDoc.on('end', function () {
				// the stream is at its end, so push the resulting base64 string to the response
				const emailResponse = EmailHandler.sendEmail("", payLoad.email, payLoad.subject, payLoad.html, finalString);
				if(emailResponse === flase) return "Error in sending email" 
			});
		
		try{
			myDoc.font('Times-Roman');
		myDoc.fontSize(12)
			.text(data);
		myDoc.end();
	}catch(err){
		logger.error('Error in pdf '+ err);
		return "DB2 error" + err;
	}
}

export default new accountStatementService();