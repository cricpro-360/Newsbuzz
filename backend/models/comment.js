const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId: mongoose.Types.ObjectId,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", commentSchema);
