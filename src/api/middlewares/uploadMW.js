import multer from 'multer';

const uploadMW = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    }
});
export default uploadMW;