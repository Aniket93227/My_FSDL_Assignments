const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, file: req.file.filename, path: `/uploads/${req.file.filename}` });
});

module.exports = router;
