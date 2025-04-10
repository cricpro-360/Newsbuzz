const multer = require('multer');
const path = require('path');

// File storage config
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Mongoose deprecation fix
mongoose.set('strictQuery', true);

// Middlewares
app.use(require('cors')());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('MongoDB Connection Error:', err));

const Post = mongoose.model('Post', new mongoose.Schema({
  title: String,
  content: String,
  imageUrl: String
}, { timestamps: true }));

// Routes
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
