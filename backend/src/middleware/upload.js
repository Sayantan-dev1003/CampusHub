const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../uploads', folder);
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
};

const pdfFilter = (req, file, cb) => {
  const allowed = /pdf|jpeg|jpg|png/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
  cb(new Error('Only PDF and image files are allowed'));
};

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

const uploadProductImage = multer({ storage: storage('products'), fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } });
const uploadEventImage = multer({ storage: storage('events'), fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } });
const uploadReceipt = multer({ storage: storage('receipts'), fileFilter: pdfFilter, limits: { fileSize: MAX_SIZE } });
const uploadAvatar = multer({ storage: storage('avatars'), fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } });

module.exports = { uploadProductImage, uploadEventImage, uploadReceipt, uploadAvatar };
