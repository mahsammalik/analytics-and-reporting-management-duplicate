import { open } from 'ibm_db';
 


class DatabaseConn {
    constructor() {
      this._connect();
    }
  
    _connect() {
        var connStr = "DATABASE=testdb;HOSTNAME=localhost;UID=db2inst1;PWD=apassword;PORT=50000";
        open(connStr, function (err,conn) {
            if (err) return console.log(err);
            
            // conn.query('select 1 from sysibm.sysdummy1', function (err, data) {
            //   if (err) console.log(err);
            //   else console.log(data);
           
            //   conn.close(function () {
            //     console.log('done');  
            //   });
            // });
          });
           
        //   open(connStr).then(
        //       conn => {
        //         conn.query("select 1 from sysibm.sysdummy1").then(data => {
        //           console.log(data);
        //           conn.closeSync();
        //         }, err => {
        //           console.log(err);
        //         });
        //       }, err => {
        //         console.log(err)
        //       }
        //   );
    }
  }
  
  export default new DatabaseConn();
