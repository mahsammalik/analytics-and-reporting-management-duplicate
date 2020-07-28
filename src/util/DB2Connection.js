import { open } from 'ibm_db';
const PDFDocument = require('pdfkit');
const fs = require('fs');
class DatabaseConn {
 
  getValue(customerMobileNumer, endDate, startDate) {
    var cn = "DATABASE=TESTDB;HOSTNAME=ibmdb2;UID=db2inst1;PWD=apassword;PORT=50000;PROTOCOL=TCPIP";
    open(cn,function(err,conn){
      const stmt = conn.prepareSync("select * from DB2INST1.ACCOUNT where TRX_ID = ? And TRX_DATETIME BETWEEN ? AND ?;");
      //Bind and Execute the statment asynchronously
      var result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
      var data = result.fetchAllSync({fetchMode:3}); // Fetch data in Array mode.
      result.closeSync();
      stmt.closeSync();
      conn.close(function(err){});
    });
  }

  create(){
    const doc = new PDFDocument;
    // fs.writeFileSync('Mohab.md', 'Hello Sync API!')
    
    doc.pipe(fs.createWriteStream(imageDIR + 'output.pdf'));
 
// Embed a font, set the font size, and render some text
doc
  // .font('fonts/PalatinoBold.ttf')
  .fontSize(25)
  .text('Some text with an embedded font!', 100, 100);
 
  doc.end();

  }

  }

  export default new DatabaseConn();
