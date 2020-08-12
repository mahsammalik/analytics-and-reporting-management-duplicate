const PDFDocument = require('pdfkit');
import DB2_Connection from '../util/DB2Connection';
import EmailHandler from '../util/EmailHandler';
const { Base64Encode } = require('base64-stream');

class accountStatementService {
	constructor(){
		this.accountStatementCall = this.accountStatementCall.bind(this);
	}


	async accountStatementCall(payLoad, res) {
		console.log("call teh account sstatement service");
		var myDoc = new PDFDocument({ bufferPages: true });
		var finalString = ''; // contains the base64 string
		let buffers = [];
		console.log("payload msisdn" + payLoad.start_date)
		const data = await DB2_Connection.getValue('1030',payLoad.end_date, payLoad.start_date);
		console.log("the account statement"+ data);
		let pdfData;
	
		if (payLoad.request == 'Download') {
			({ myDoc, pdfData } = downloadProcess(myDoc, buffers, pdfData, res));
		}
		else if (payLoad.request == 'Email') {
			myDoc.pipe(new Base64Encode());
			myDoc.on('data', function (chunk) {
				finalString += chunk;
			});
	
			myDoc.on('end', function () {
				// the stream is at its end, so push the resulting base64 string to the response
				EmailHandler.sendEmail("", payLoad.email, payLoad.subject, payLoad.html, finalString);
				res.json("the mail send to push ");
			});
		}
		myDoc.font('Times-Roman');
		myDoc.fontSize(12)
			.text(data);
		myDoc.end();
	}

	downloadProcess(myDoc, buffers, pdfData, res) {
		myDoc = new PDFDocument({ bufferPages: true });
		myDoc.on('data', buffers.push.bind(buffers));
		myDoc.on('end', () => {
			pdfData = Buffer.concat(buffers);
			res.writeHead(200, {
				'Content-Length': Buffer.byteLength(pdfData),
				'Content-Type': 'application/pdf',
				'Content-disposition': 'attachment;filename=Account.pdf',
			})
				.end(pdfData);
		});
		return { myDoc, pdfData };
	}
}

export default new accountStatementService();