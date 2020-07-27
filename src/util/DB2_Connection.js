import { open } from 'ibm_db';
const PDFDocument = require('pdfkit');
const fs = require('fs');

class DatabaseConn {
    constructor() {
      this._connect();
    }
    createPDF(){
      const doc = new PDFDocument();
 
// Pipe its output somewhere, like to a file or HTTP response
// See below for browser usage
doc.pipe(fs.createWriteStream('/Users/mohabnazmy/jazz/output.pdf'));
 
// Embed a font, set the font size, and render some text
doc
  .font('fonts/PalatinoBold.ttf')
  .fontSize(25)
  .text('Some text with an embedded font!', 100, 100);
 
// Add an image, constrain it to a given size, and center it vertically and horizontally
doc.image('path/to/image.png', {
  fit: [250, 300],
  align: 'center',
  valign: 'center'
});
 
// Add another page
doc
  .addPage()
  .fontSize(25)
  .text('Here is some vector graphics...', 100, 100);
 
// Draw a triangle
doc
  .save()
  .moveTo(100, 150)
  .lineTo(100, 250)
  .lineTo(200, 250)
  .fill('#FF3300');
 
// Apply some transforms and render an SVG path with the 'even-odd' fill rule
doc
  .scale(0.6)
  .translate(470, -380)
  .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
  .fill('red', 'even-odd')
  .restore();
 
// Add some text with annotations
doc
  .addPage()
  .fillColor('blue')
  .text('Here is a link!', 100, 100)
  .underline(100, 100, 160, 27, { color: '#0000FF' })
  .link(100, 100, 160, 27, 'http://google.com/');
 
// Finalize PDF file
doc.end();
    }
    _connect() {
        // var connStr = "DATABASE=TESTDB;HOSTNAME=ibmdb2;UID=db2inst1;PWD=apassword;PORT=50000;PROTOCOL=TCPIP";
        // open(connStr, function (err,conn) {
        //     if (err) return console.log(err);
        //     console.log("connection is success to db2");
            
        //     conn.query('select * from DB2INST1.ACCOUNT ', function (err, data) {
        //       if (err) console.log(err);
        //       else console.log(data);
           
        //       conn.close(function () {
        //         console.log('done');  
        //       });
        //     });
        //   });

  var cn = "DATABASE=TESTDB;HOSTNAME=ibmdb2;UID=db2inst1;PWD=apassword;PORT=50000;PROTOCOL=TCPIP";

// open(cn,function(err,conn){
//   conn.prepare("select * from DB2INST1.ACCOUNT where TRX_ID = ?", function (err, stmt) {
//     if (err) {
//       //could not prepare for some reason
//       console.log(err);
//       return conn.closeSync();
//     }

    
//     //Bind and Execute the statment asynchronously
//     stmt.execute([ 1030], function (err, result) {
//       if( err ) console.log(err);
//       else {
//         result.forEach(x => console.log(x))
//         result.closeSync()
//       }
//       //Close the connection
//       stmt.close(function(err){
//         if(err){
//           console.log(err)
//         }
//         conn.close(function(err){});
//       });
//     });
//   });
// });

open(cn,function(err,conn){
  var stmt = conn.prepareSync("select * from DB2INST1.ACCOUNT where TRX_ID = ?");

  //Bind and Execute the statment asynchronously
  var result = stmt.executeSync([1030]);
  var data = result.fetchAllSync({fetchMode:3}); // Fetch data in Array mode.
  console.log(data);
  result.closeSync();
  stmt.closeSync();



  //Close the connection
  conn.close(function(err){});
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
