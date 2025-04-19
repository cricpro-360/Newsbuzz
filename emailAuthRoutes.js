const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('./models/User'); // adjust path if needed

const otpStore = {}; // Store OTP temporarily

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hindusthannews360@gmail.com',
    pass: 'cpiozradcbpenhla'
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: '"Hindusthan News OTP" <hindusthannews360@gmail.com>',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}`
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP required' });
  }

  if (otpStore[email] != otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  try {
    let user = await User.findOne({ email });

    // Create user if not exist
    if (!user) {
      user = await User.create({ email, username: '', profilePic: '' });
    }

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '7d' });

    delete otpStore[email]; // clear OTP after success
    res.json({ success: true, message: 'Login successful', token, user });
  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
