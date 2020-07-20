import sharp from 'sharp';
import {
  uuid
} from 'uuidv4';
import path from 'path';

class ImageHandler {
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


  static filename() {
    return `${uuid()}.jpg`;
  }


  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`);
  }


}
export default ImageHandler;