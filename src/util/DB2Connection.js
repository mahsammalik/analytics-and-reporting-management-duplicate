import { open } from 'ibm_db';
import responseCodeHandler from './responseCodeHandler';


const cn = process.env.DB2_CONNECTION || config.IBMDB2.connectionString;

class DatabaseConn {

  async getValue(customerMobileNumer, endDate, startDate) {

    try{
      
      let concatenatResult;
      let conn = await open(cn);
      const stmt = conn.prepareSync("select * from DB2INST1.ACCOUNTSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ?;");
      let result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
      const resultArrayFormat = result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      concatenatResult = resultArrayFormat.join('\n');
      console.log("the result of database" +concatenatResult);
      result.closeSync(); 
      stmt.closeSync();
      conn.close(function (err) { });
      return concatenatResult;

    }
    catch(err){
      logger.error('Database connection error'+ err);
      return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
    }
  }

  async getValueArray(customerMobileNumer, endDate, startDate) {

    try{
      const conn = await open(cn);
      const stmt = conn.prepareSync("select * from DB2INST1.ACCOUNTSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ?;");
      const result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
      const arrayResult =  result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      result.closeSync();
      stmt.closeSync();
      conn.close(function (err) { });
      console.log('the resulted array '+ arrayResult)
      return arrayResult;

    }
    catch(err){
      logger.error('Database connection error'+ err);
      return "Database Error"
    }
  }

  async getTaxValueArray(customerMobileNumer, endDate, startDate) {

    try{
      const conn = await open(cn);
      const stmt = conn.prepareSync("select * from DB2INST1.TAXSTATEMENT where MSISDN = ? And TRX_DATETIME BETWEEN ? AND ?;");
      const result = stmt.executeSync([customerMobileNumer, startDate, endDate]);
      const arrayResult =  result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      result.closeSync();
      stmt.closeSync();
      conn.close(function (err) { });
      console.log('the resulted array '+ arrayResult)
      return arrayResult;

    }
    catch(err){
      logger.error('Database connection error'+ err);
      return "Database Error"
    }
  }

  async addAccountStatement(msisdn, trxDateTime, trxId, transactionType, channel, description, amountDebited, amountCredited, runningBalance) {

    try{
      
      let conn = await open(cn);
      const stmt = conn.prepareSync("INSERT INTO DB2INST1.ACCOUNTSTATEMENT (MSISDN, TRX_DATETIME, TRX_ID, TRANSACTION_TYPE, CHANNEL, DESCRIPTION, AMOUNT_DEBITED, AMOUNT_CREDITED, RUNNING_BALANCE) VALUES(?,?,?,?,?,?,?,?,?);");
      stmt.executeSync([ msisdn, trxDateTime, trxId, transactionType, channel, description, amountDebited, amountCredited, runningBalance]);
      // return result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
      // result.closeSync();
      stmt.closeSync();
      conn.close(function (err) { });
      console.log("insert done");
      return;

    }
    catch(err){
      logger.error('Database connection error'+ err);
      return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
    }
  }



async addTaxStatement(msisdn, trxDateTime, trxId, transactionType, channel, description, amountDebited, amountCredited, runningBalance) {

  try{
    
    let conn = await open(cn);
    const stmt = conn.prepareSync("INSERT INTO DB2INST1.TAXSTATEMENT (MSISDN, TRX_DATETIME, TRX_ID, TRANSACTION_TYPE, CHANNEL, DESCRIPTION, AMOUNT_DEBITED, AMOUNT_CREDITED, RUNNING_BALANCE) VALUES(?,?,?,?,?,?,?,?,?);");
    stmt.executeSync([ msisdn, trxDateTime, trxId, transactionType, channel, description, amountDebited, amountCredited, runningBalance]);
    // return result.fetchAllSync({ fetchMode: 3 }); // Fetch data in Array mode.
    // result.closeSync();
    stmt.closeSync();
    conn.close(function (err) { });
    console.log("insert done");
    return;

  }
  catch(err){
    logger.error('Database connection error'+ err);
    return await responseCodeHandler.getResponseCode(config.responseCode.useCases.accountStatement.database_connection, err);
  }
}
}

export default new DatabaseConn();
