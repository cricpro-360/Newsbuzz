const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Cloudinary setup
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dods2fuur',
  api_key: '974131963864589',
  api_secret: 'f5HXawyekgvI2QSECiB7jSHwY2A'
});

// Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'newsbuzz',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', true);

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// Mongoose model
const Post = mongoose.model('Post', new mongoose.Schema({
  title: String,
  content: String,
  imageUrl: String,
  location: String
}, { timestamps: true }));
  

// Routes
app.get('/posts', async (req, res) => {
  try {
    const { location } = req.query;
    const query = location? { location } : {};
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

app.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imageUrl: req.file ? req.file.path : null
      location: req. body.location
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ message: 'Error creating post' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
