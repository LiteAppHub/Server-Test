let express = require('express'),
  multer = require('multer'),
  _router = express.Router();

// Multer File upload settings
const DIR = './uploads/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});

var upload = multer({
  storage: storage,
  });

// User model

_router.post('/upload', upload.array('challengeDoc', 6), (req, res, next) => {
  const reqFiles = []
  const url = req.protocol + '://' + req.get('host')
  for (var i = 0; i < req.files.length; i++) {
    reqFiles.push(url + '/uploads/' + req.files[i].filename)
  }
  console.log('reqFiles', reqFiles)

  
})

module.exports = _router;