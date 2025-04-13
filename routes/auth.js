const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate OTP (simple for now)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Temporary store OTPs (use DB/Redis in production)
const otps = {};

router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  const otp = generateOTP();
  otps[phone] = otp;

  // In production, send SMS here
  console.log(`OTP for ${phone}: ${otp}`);

  res.json({ message: 'OTP sent' });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  if (otps[phone] !== otp) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  // Remove OTP after use
  delete otps[phone];

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone });

  const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '7d' });

  res.json({ token, user });
});

module.exports = router;
