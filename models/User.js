const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  profilePic: { type: String, default: '' }
});

module.exports = mongoose.model('User', userSchema);
