const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: String,
  username: String,
  profilePic: String,
  otp: String, // temporary OTP
});

module.exports = mongoose.model('User', UserSchema);
