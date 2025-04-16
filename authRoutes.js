const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const twilio = require('twilio');

const router = express.Router();
const JWT_SECRET = 'myfirstsecretkey1817';

// Twilio credentials
const TWILIO_ACCOUNT_SID = 'AC637e3f451c56f7525695952b9c9e0262';
const TWILIO_AUTH_TOKEN = '48402e9870554120df595d46d61131cb';
const TWILIO_PHONE_NUMBER = '+19713902384';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Send OTP via SMS (using Twilio)
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

  try {
    // Send OTP via Twilio SMS
    await client.messages.create({
      body: `Your OTP code is ${otp}`,
      to: phone, // recipient's phone number
      from: TWILIO_PHONE_NUMBER, // Twilio phone number
    });

    res.json({ success: true, message: 'OTP sent via SMS' });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and return JWT token
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  const user = await User.findOne({ phone, otp });
  if (!user) return res.status(400).json({ error: 'Invalid OTP' });

  user.otp = null; // Reset OTP after verification
  await user.save();

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

module.exports = router;
