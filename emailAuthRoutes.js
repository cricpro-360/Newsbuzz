const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const otpStore = {}; // Store OTP temporarily

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hindusthannews360@gmail.com',
    pass: 'cpiozradcbpenhla' // Your App Password (remove spaces)
  }
});

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

module.exports = router;
