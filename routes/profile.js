// routes/profile.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Profile = mongoose.model('Profile', new mongoose.Schema({
  username: String,
  bio: String,
  profilePic: String
}, { timestamps: true }));

// Save or update profile
router.post('/', async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;
    const existing = await Profile.findOne({ username });

    let profile;
    if (existing) {
      existing.bio = bio;
      existing.profilePic = profilePic;
      profile = await existing.save();
    } else {
      profile = new Profile({ username, bio, profilePic });
      await profile.save();
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Profile save failed' });
  }
});

// Get profile by username
router.get('/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    if (!profile) return res.status(404).json({ message: 'Not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Fetch error' });
  }
});

module.exports = router;
