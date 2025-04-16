const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const OTP_STORE = {};
const FAST2SMS_API_KEY = '4tdXGQKTpsJy0ONZY715vBDSHUMxIEmhewjoa6blV2fWnCAquc3PODyRZ26JVjbABKSICotNHdGsMpha';

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  OTP_STORE[phone] = otp;

  try {
    await axios.post('https://www.fast2sms.com/dev/bulkV2', {}, {
      params: {
        authorization: FAST2SMS_API_KEY,
        variables_values: otp,
        route: 'otp',
        numbers: phone
      }
    });
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  if (OTP_STORE[phone] !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  delete OTP_STORE[phone];

  let user = await User.findOne({ phone });
  if (!user) user = await User.create({ phone });

  const token = jwt.sign({ userId: user._id }, 'myfirstsecretkey1817', { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      username: user.username,
      profilePic: user.profilePic
    }
  });
});

module.exports = router;
