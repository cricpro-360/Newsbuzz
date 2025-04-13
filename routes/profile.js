const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');

// Use the same cloudinary storage from your main server
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profilePics',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }]
  }
});

const upload = multer({ storage });

// GET profile by phone
router.get('/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST/UPDATE profile
router.post('/', upload.single('profilePic'), async (req, res) => {
  try {
    const { phone, username, password } = req.body;

    const update = {
      username,
      password,
    };

    if (req.file) {
      update.profilePic = req.file.path;
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { $set: update },
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
