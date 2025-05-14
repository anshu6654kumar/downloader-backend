// server/server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { originalname, filename } = req.file;
  res.json({
    name: originalname,
    url: `${req.protocol}://${req.get('host')}/download/${filename}`,
  });
});

// List files endpoint
app.get('/files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files');
    }

    const fileList = files.map(file => ({
      name: file,
      url: `${req.protocol}://${req.get('host')}/download/${file}`,
    }));

    res.json(fileList);
  });
});

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
