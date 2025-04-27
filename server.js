// server.js (fixed version)

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Models
const Post = require('./models/Post');
const User = require('./models/User');

// Initialize App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
mongoose.set('strictQuery', true);
app.use(cors());
app.use(bodyParser.json());

// Cloudinary setup
cloudinary.config({
  cloud_name: 'dods2fuur',
  api_key: '974131963864589',
  api_secret: 'f5HXawyekgvI2QSECiB7jSHwY2A'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'newsbuzz',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ storage });

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Email auth routes
const emailAuthRoutes = require('./emailAuthRoutes');
app.use('/auth', emailAuthRoutes);

// Create or update a user
app.post('/user/create-or-update', async (req, res) => {
  try {
    const { userId, username, profilePic, bio } = req.body;
    let user = await User.findById(userId);

    if (user) {
      user.username = username;
      user.profilePic = profilePic;
      user.bio = bio;
      await user.save();
    } else {
      user = new User({
        _id: userId,
        username,
        profilePic,
        bio
      });
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error creating/updating user' });
  }
});

// Create a post
app.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imageUrl: req.file ? req.file.path : null,
      state: req.body.state,
      district: req.body.district,
      taluk: req.body.taluk,
      username: user.username,
      profilePic: user.profilePic,
      userId: user._id.toString(),
      user: user._id
    });

    await post.save();
    user.posts.push(post._id);
    await user.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Get posts (normal full loading)
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username bio profilePic');

    const modifiedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      state: post.state,
      district: post.district,
      taluk: post.taluk,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      username: post.user?.username || '',
      profilePic: post.user?.profilePic || '',
      bio: post.user?.bio || ''
    }));

    res.json(modifiedPosts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Increment view count (should be app.get, not router)
app.get('/posts/view/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: post.views });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update views' });
  }
});

// Add this inside server.js

app.get('/posts-stream', async (req, res) => {
  try {
    const cursor = Post.find().sort({ createdAt: -1 }).cursor();  // MongoDB cursor
    res.setHeader('Content-Type', 'application/json');
    res.write('['); // JSON array start

    let first = true;
    for (let post = await cursor.next(); post != null; post = await cursor.next()) {
      if (!first) res.write(',');
      const simplePost = {
        _id: post._id,
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        state: post.state,
        district: post.district,
        taluk: post.taluk,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      };
      res.write(JSON.stringify(simplePost));
      first = false;

      // (Optional) wait 100ms to simulate network delay
      // await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.write(']');
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error streaming posts' });
  }
});




// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
