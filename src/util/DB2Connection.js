import { open } from 'ibm_db';
import PDFHandler from './PDFHandler';
import { output } from 'pdfkit';

class DatabaseConn {
 
  getValue(customerMobileNumer, endDate, startDate) {
    var cn = "DATABASE=TESTDB;HOSTNAME=ibmdb2;UID=db2inst1;PWD=apassword;PORT=50000;PROTOCOL=TCPIP";
    open(cn,function(err,conn){
      const stmt = conn.prepareSync("select * from DB2INST1.ACCOUNT where TRX_ID = ? And TRX_DATETIME BETWEEN ? AND ?;");
      //Bind and Execute the statment asynchronously
      let result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
      const resultArrayFormat = result.fetchAllSync({fetchMode:3}); // Fetch data in Array mode.
      const concatenatResilt = resultArrayFormat.join('/n')
      PDFHandler.createPDF(concatenatResilt, customerMobileNumer);
      result.closeSync();
      stmt.closeSync();
      conn.close(function(err){});
    });
  }

 

  }

  export default new DatabaseConn();
