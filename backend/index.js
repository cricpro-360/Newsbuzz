// backend/index.js const express = require("express"); const cors = require("cors"); const multer = require("multer"); const mongoose = require("mongoose"); const cloudinary = require("cloudinary").v2; const { CloudinaryStorage } = require("multer-storage-cloudinary"); require("dotenv").config();

const app = express(); app.use(cors()); app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, });

const postSchema = new mongoose.Schema({ title: String, content: String, category: String, location: String, language: String, imageUrl: String, createdAt: { type: Date, default: Date.now }, });

const commentSchema = new mongoose.Schema({ postId: mongoose.Types.ObjectId, text: String, createdAt: { type: Date, default: Date.now }, });

const Post = mongoose.model("Post", postSchema); const Comment = mongoose.model("Comment", commentSchema);

cloudinary.config({ cloud_name: process.env.CLOUD_NAME, api_key: process.env.CLOUD_KEY, api_secret: process.env.CLOUD_SECRET, });

const storage = new CloudinaryStorage({ cloudinary, params: { folder: "newsbuzz", allowed_formats: ["jpg", "png", "jpeg"], }, });

const upload = multer({ storage });

app.post("/posts", upload.single("image"), async (req, res) => { const { title, content, category, location, language } = req.body; const imageUrl = req.file.path; const post = new Post({ title, content, category, location, language, imageUrl }); await post.save(); res.status(201).json(post); });

app.get("/posts", async (req, res) => { const { category, location, lang } = req.query; const filter = {}; if (category) filter.category = category; if (location) filter.location = location; if (lang) filter.language = lang; const posts = await Post.find(filter).sort({ createdAt: -1 }); res.json(posts); });

app.post("/comments/:postId", async (req, res) => { const { postId } = req.params; const { text } = req.body; const comment = new Comment({ postId, text }); await comment.save(); res.status(201).json(comment); });

app.get("/comments/:postId", async (req, res) => { const { postId } = req.params; const comments = await Comment.find({ postId }).sort({ createdAt: -1 }); res.json(comments); });

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

