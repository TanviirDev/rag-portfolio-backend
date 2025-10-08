import multer from 'multer';
import fs from 'fs';
import {
  UPLOAD_DIR,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '../constants/index.js';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.',
      ),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export default upload;
