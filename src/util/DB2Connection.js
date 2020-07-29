import { open } from 'ibm_db';


class DatabaseConn {

  async getValue(customerMobileNumer, endDate, startDate) {
    console.log("Before constant statement");
    var cn = "DATABASE=TESTDB;HOSTNAME=ibmdb2;UID=db2inst1;PWD=apassword;PORT=50000;PROTOCOL=TCPIP";
    console.log("start callback");
    let concatenatResult;
    let conn = await open(cn);
    const stmt = conn.prepareSync("select * from DB2INST1.ACCOUNT where TRX_ID = ? And TRX_DATETIME BETWEEN ? AND ?;");
    let result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
    const resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
    concatenatResult = resultArrayFormat.join('/n');
    result.closeSync();
    stmt.closeSync();
    conn.close(function (err) { });
    return concatenatResult;
  }
}

export default new DatabaseConn();
