const multer = require('multer');

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  // Images (≤ 5MB)
  'image/jpeg': 5 * 1024 * 1024,
  'image/jpg': 5 * 1024 * 1024,
  'image/png': 5 * 1024 * 1024,
  'image/webp': 5 * 1024 * 1024,
  // Documents (≤ 10MB)
  'application/pdf': 10 * 1024 * 1024,
  // Video (≤ 25MB)
  'video/mp4': 25 * 1024 * 1024,
  'video/quicktime': 25 * 1024 * 1024, // .mov
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    const err = new Error(
      `Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WEBP, PDF, MP4, MOV.`
    );
    err.statusCode = 400;
    return cb(err, false);
  }
  cb(null, true);
};

// Multer upload instance with max overall limit of 25MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
});

// Middleware to enforce per-file-type size limits
const validateFileSize = (req, res, next) => {
  if (!req.file) return next();

  const maxAllowed = ALLOWED_MIME_TYPES[req.file.mimetype];
  if (maxAllowed && req.file.size > maxAllowed) {
    const sizeInMB = (maxAllowed / (1024 * 1024)).toFixed(0);
    return res.status(400).json({
      success: false,
      message: `File size exceeds limit of ${sizeInMB}MB for ${req.file.mimetype}.`,
    });
  }

  next();
};

module.exports = {
  upload,
  validateFileSize,
  ALLOWED_MIME_TYPES,
};
