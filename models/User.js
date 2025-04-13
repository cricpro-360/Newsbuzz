const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  username: String,
  password: String,
  profilePic: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
