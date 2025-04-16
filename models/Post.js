const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  state: String,
  district: String,
  taluk: String,
  imageUrl: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  profilePic: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Post', PostSchema);
