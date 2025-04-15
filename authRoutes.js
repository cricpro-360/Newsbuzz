const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret';

// Send OTP (simulate)
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, otp });
  } else {
    user.otp = otp;
    await user.save();
  }

  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ success: true, message: 'OTP sent' });
});

// Verify OTP and return JWT token
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  const user = await User.findOne({ phone, otp });
  if (!user) return res.status(400).json({ error: 'Invalid OTP' });

  user.otp = null;
  await user.save();

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

module.exports = router;
