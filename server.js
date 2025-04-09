const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

// Schema
const Post = mongoose.model("Post", {
  title: String,
  content: String,
  image: String,
  location: String,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Upload setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Routes
app.post("/api/posts", upload.single("image"), async (req, res) => {
  const { title, content, location, category } = req.body;
  const post = new Post({
    title,
    content,
    location,
    category,
    image: req.file ? `/uploads/${req.file.filename}` : ""
  });
  await post.save();
  res.status(201).json(post);
});

app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
