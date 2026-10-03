const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function maybeSingle(field) {
  return (req, res, next) => {
    const type = req.headers['content-type'] || '';
    if (type.includes('multipart/form-data')) {
      return upload.single(field)(req, res, next);
    }
    return next();
  };
}

module.exports = { upload, maybeSingle };
