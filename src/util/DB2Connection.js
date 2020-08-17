import { open } from 'ibm_db';

const connectionString = process.env.DB2_CONNECTION || config.db2.connectionString;

class DatabaseConn {

  async getValue(customerMobileNumer, endDate, startDate) {

    try{
      var cn = "DATABASE=TESTDB;HOSTNAME=ibmdb2;UID=db2inst1;PWD=apassword;PORT=50000;PROTOCOL=TCPIP";
      let concatenatResult;
      let conn = await open(cn);
      const stmt = conn.prepareSync("select * from DB2INST1.ACCOUNT where TRX_ID = ? And TRX_DATETIME BETWEEN ? AND ?;");
      let result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
      const resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      concatenatResult = resultArrayFormat.join('/n');
      console.log("the result of database" +concatenatResult);
      result.closeSync();
      stmt.closeSync();
      conn.close(function (err) { });
      return concatenatResult;

    }
    catch(err){
      logger.error(err);
      logger.error('Database connection error');
      return "DB2 error" + err;
    }
  }
}

export default new DatabaseConn();
