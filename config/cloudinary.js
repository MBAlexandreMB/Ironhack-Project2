const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

var storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'companies-logos',
  allowedFormats: ['jpg', 'png'],
  filename: function (req, file, cb) {
    cb(null, file.filename);
  }
});

const uploadCloudCompany = multer({ storage: storage });

var userStorage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'user-photos',
  allowedFormats: ['jpg', 'png'],
  filename: function (req, file, cb) {
    cb(null, file.filename);
  }
});

const uploadCloudUser = multer({ storage: userStorage });


module.exports = {uploadCloudCompany, uploadCloudUser};