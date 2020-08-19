const PDFDocument = require('../util/PDFDocumentWithTables');
import DB2_Connection from '../util/DB2Connection';
import EmailHandler from '../util/EmailHandler';
const { Base64Encode } = require('base64-stream');
const { convertArrayToCSV } = require('convert-array-to-csv');
var base64 = require('file-base64');
const CSV = require('csv-string');
const fs = require('fs');
const generate = require('csv-generate')
const parse = require('csv-parser')



class accountStatementService {
	constructor(){
		this.sendEmailPDF_Format = this.sendEmailPDF_Format.bind(this);
		this.sendEmailCSV_Format = this.sendEmailCSV_Format.bind(this);
		this.test = this.test.bind(this);
	}
	async sendEmailCSV_Format(payLoad) {
		console.log("enter the csv method")
		const data = await DB2_Connection.getValue(payLoad.msisdn, payLoad.end_date, payLoad.start_date);	
		console.log("the IBM DB2 data "+ data)
		let output = []
		const parser = parse({
			delimiter: "\n",
			separator: "\n"
		  }).pipe(fs.createWriteStream(imageDIR + 'test.csv'));
		  // Use the readable stream api
		  parser.on('readable', function(){
			let record
			while (record = parser.read()) {
			  output.push(record)
			}
		  })
		  // Catch any error
		  parser.on('error', function(err){
			console.error(err.message)
		  })
		  // When we are done, test that the parsed output matched what expected
		  parser.on('end', function(){
			let buff = new Buffer.from(output);
			let base64data = buff.toString('base64');
			EmailHandler.sendEmail("", payload.email, payload.subject, payload.html, base64data, res)
			  })
		  // Write data to the stream
		  parser.write("Trx ID, Trx DateTime, MSISDN, Transaction Type, Channel, Description, Amount debited, Amount credited, Running balance\n")
		  parser.write(data	)
		  // Close the readable stream
		  parser.end()


		// generate(data)
		//   .pipe(fs.createWriteStream(imageDIR + 'test.csv'))

}

	async sendEmailPDF_Format(payload, res) {
		console.log("email pdf")
		const myDoc = new PDFDocument({ bufferPages: true });
		myDoc.pipe(fs.createWriteStream(imageDIR + 'test.pdf'));
		let finalString = ''; // contains the base64 string
		const data = await DB2_Connection.getValueArray( payload.msisdn, payload.end_date, payload.start_date);
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
				headers: ['Trx ID', 'Trx DateTime', 'MSISDN', 'Transaction Type', 'Channel', 'Description', 'Amount debited', 'Amount credited', 'Running balance'],
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



async populateDataBase(){

	await DB2_Connection.addAccountStatement( '03015091633', '2020-04-26', '010251945119', 'Money Transfer - Mobile Account', 'USSD', 'Beneficiary Details: 923079770309', 1, 0, 996.19);
	await DB2_Connection.addAccountStatement( '03015091633', '2020-05-26', '010099506870', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923125796890', 1, 0, 997.19);
	await DB2_Connection.addAccountStatement( '03015091633', '2020-06-26', '010066562541', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923455108911', 0, 500, 998.19);
	await DB2_Connection.addAccountStatement( '03015091633', '2020-07-26', '009949357058', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 498.19);
	await DB2_Connection.addAccountStatement( '03015091633', '2020-08-26', '009949336950', 'Money Transfer - Bank', 'Mobile App', 'Bank Transfer', 500, 0, 998.19);
	await DB2_Connection.addAccountStatement( '03015091633', '2020-09-26', '009853747703', 'Money Transfer - CNIC', 'Mobile App', 'Beneficiary Details: 923465470362', 2500, 0, 1498.19);
	await DB2_Connection.addAccountStatement( '03015091633', '2020-10-26', '009853729041', 'Money Transfer - Bank', 'ATM', 'Beneficiary Details: 923015091633', 0, 3000, 4058.19);
	await DB2_Connection.addAccountStatement( '03015091633', '2020-11-26', '009706631603', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', 0, 5, 1058.19);
	await DB2_Connection.addAccountStatement( '03015091633', '2020-12-26', '009660266611', 'Online Payment', 'Payment Gateway', 'Online Payment', 751, 0, 1053.13);
}
async test() {
const PDFDocument = require('../util/PDFDocumentWithTables');
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream(imageDIR + 'output2.pdf'));
const data = await DB2_Connection.getValueArray('03015091633', '2021-10-01', '2001-02-01');
const data2 = await DB2_Connection.getValue('03015091633', '2021-10-01', '2001-02-01');

console.log("Array Format statement"+ data);
console.log("String Format statement"+ data2);
const table0 = {
    headers: ['MSISDN', 'Trx DateTime', 'Trx ID', 'Transaction Type', 'Channel', 'Description', 'Amount debited', 'Amount credited', 'Running balance'],
    rows: data
};

doc.table(table0, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(5),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(5)
});

// const table1 = {
//     headers: ['MSISDN', 'Trx DateTime', 'Trx ID', 'Transaction Type', 'Channel', 'Description', 'Amount debited', 'Amount credited', 'Running balance'],
//     rows: data
// };

// doc.moveDown().table(table1, 100, 350, { width: 300 });

doc.end();
return ;
}

}

export default new accountStatementService();