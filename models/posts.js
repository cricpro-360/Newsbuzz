const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  imageUrl: String,
  state: String,
  district: String,
  username: String, // directly store the author's username
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
