import { open } from 'ibm_db';
const PDFDocument = require('pdfkit');
const fs = require('fs');

class DatabaseConn {
 
  getValue(customerMobileNumer, endDate, startDate) {
    var cn = "DATABASE=TESTDB;HOSTNAME=ibmdb2;UID=db2inst1;PWD=apassword;PORT=50000;PROTOCOL=TCPIP";
    open(cn,function(err,conn){
      const stmt = conn.prepareSync("select * from DB2INST1.ACCOUNT where TRX_ID = ? And TRX_DATE BETWEEN ? AND ?;");
      //Bind and Execute the statment asynchronously
      var result = stmt.executeSync([customerMobileNumer, endDate, startDate]);
      var data = result.fetchAllSync({fetchMode:3}); // Fetch data in Array mode.
      console.log(data);
      result.closeSync();
      stmt.closeSync();
      conn.close(function(err){});
      return data;
    });
  }
  }


  
  export default new DatabaseConn();
