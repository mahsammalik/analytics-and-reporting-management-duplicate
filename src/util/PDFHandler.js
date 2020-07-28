
const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFHandler {
  constructor(folder, size) {
    this.folder = folder;
    this.size = size;
  }


 
  createPDF(Input, MSISDN){
      const doc = new PDFDocument;
      let outputText = '';
      doc.pipe(fs.createWriteStream(imageDIR + 'output'+ MSISDN + '.pdf'));
      doc
      .fontSize(25)
      .text(Input, 100, 100);
      doc.end();
    }   
  
 

}
export default new PDFHandler();