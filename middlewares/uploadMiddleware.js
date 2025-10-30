const multer = require('multer');
const path = require('path');
const fs = require('fs');



const uploadDir = './uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // On génère un nom unique temporaire (timestamp + extension)
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  }
});

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};




// Limite la taille à 2 Mo
const limits = { fileSize: 2 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
