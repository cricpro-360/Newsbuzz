const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  location: String,
  language: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
