const PDFDocument = require('../util/PDFDocumentWithTables');
import DB2_Connection from '../util/DB2Connection';
import EmailHandler from '../util/EmailHandler';
const { Base64Encode } = require('base64-stream');
const { convertArrayToCSV } = require('convert-array-to-csv');
var base64 = require('file-base64');
const CSV = require('csv-string');
const fs = require('fs');

class taxStatementService {
	constructor(){
		this.sendEmailPDF_Format = this.sendEmailPDF_Format.bind(this);
	}


	async sendTaxStatement(payload, res) {
		console.log("email pdf")
		const myDoc = new PDFDocument({ bufferPages: true });
		myDoc.pipe(fs.createWriteStream(imageDIR + 'test.pdf'));
		let finalString = ''; // contains the base64 string
		const data = await DB2_Connection.getTaxValueArray( payload.msisdn, payload.end_date, payload.start_date);
		console.log("the output of changing database"+ data)
		if(data === 'Database Error') return "Database Error"
			myDoc.pipe(new Base64Encode());
				myDoc.on('data', function (chunk) {
					finalString += chunk;
				});
			myDoc.on('end', function () {
				// the stream is at its end, so push the resulting base64 string to the response
				 EmailHandler.sendEmail("", payload.email, payload.subject, payload.html, finalString, res)
			});
		try{
			
			console.log("Array Format statement"+ data);
			const table0 = {
				headers: ['Trx ID', 'Trx DateTime', 'MSISDN', 'Total Tax Deducted', 'Sales Tax', 'Income Tax', 'Withholding Tax', 'Fee', 'Commission'],
				rows: data
			};
			
			myDoc.table(table0, {
				prepareHeader: () => myDoc.font('Helvetica-Bold').fontSize(5),
				prepareRow: (row, i) => myDoc.font('Helvetica').fontSize(5)
			});
		myDoc.end();
	}catch(err){
		logger.error('Error in pdf Creation'+ err);
		return "PDF creation error";
	}
}


}

export default new taxStatementService();