import sharp from 'sharp';
import {
  uuid
} from 'uuidv4';
import path from 'path';
const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFHandler {
  constructor(folder, size) {
    this.folder = folder;
    this.size = size;
  }

  async save(buffer) {
    const filename = ImageHandler.filename();
    const filepath = this.filepath(filename);

    await sharp(buffer)
      .resize(this.size.width, this.size.height, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFile(filepath);

    return filename;
  }
  create(){
    // return "all";
    var doc = new jsPDF()

doc.text('Hello world!', 10, 10)
doc.save('a4.pdf')
  }
  createPDF(){
    const doc = new PDFDocument();

    // Create a document
try{
 
// Pipe its output somewhere, like to a file or HTTP response
// See below for browser usage
doc.pipe(fs.createWriteStream('output.pdf'));
 
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
}catch(err){
console.error(err);
}
  }
 


  static filename() {
    return `${uuid()}.jpg`;
  }


  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`);
  }


}
export default new PDFHandler();