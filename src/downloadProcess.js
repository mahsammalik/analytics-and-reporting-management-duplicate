const PDFDocument = require('pdfkit');
export function downloadProcess(myDoc, buffers, pdfData, res) {
  myDoc = new PDFDocument({ bufferPages: true });
  myDoc.on('data', buffers.push.bind(buffers));
  myDoc.on('end', () => {
    pdfData = Buffer.concat(buffers);
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(pdfData),
      'Content-Type': 'application/pdf',
      'Content-disposition': 'attachment;filename=Account.pdf',
    })
      .end(pdfData);
  });
  return { myDoc, pdfData };
}
