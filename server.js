// server.js (updated with user create-or-update route and post creation with user data) 

const express = require('express'); const mongoose = require('mongoose'); const bodyParser = require('body-parser'); const multer = require('multer'); const cors = require('cors'); require('dotenv').config();

const cloudinary = require('cloudinary').v2; const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ cloud_name: 'dods2fuur', api_key: '974131963864589', api_secret: 'f5HXawyekgvI2QSECiB7jSHwY2A' });

const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'newsbuzz', allowed_formats: ['jpg', 'png', 'jpeg'], transformation: [{ width: 800, height: 600, crop: 'limit' }] } });

const upload = multer({ storage });

const app = express(); const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', true); app.use(cors()); app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB Connected')) .catch((err) => console.error('MongoDB Connection Error:', err));

const postModels = require('./models/Post');
const userModels = require('./models/User');

const emailAuthRoutes = require('./emailAuthRoutes');
app.use('/auth', emailAuthRoutes);

const shopRoutes = require('./routes/shops');
app.use('/shops', shopRoutes);

// Create or update a user app.post('/user/create-or-update', async (req, res) => { try { const { userId, username, profilePic, bio } = req.body; let user = await User.findById(userId);

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

} catch (err) { res.status(500).json({ message: 'Error creating/updating user' }); } });

// Create a post app.post('/posts', upload.single('image'), async (req, res) => { try { const user = await User.findById(req.body.userId); if (!user) return res.status(404).json({ message: 'User not found' });

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

} catch (err) { res.status(500).json({ message: 'Error creating post' }); } });

// Get posts 
app.get('/posts', async (req, res) => { try { const posts = await Post.find() .sort({ createdAt: -1 }) .populate('user', 'username bio profilePic');

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

//shop
  const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  name: String,
  phone: String,
  category: String,
  state: String,
  district: String,
  taluk: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Shop', ShopSchema);                                           

res.json(modifiedPosts);

} catch (err) { res.status(500).json({ message: 'Error fetching posts' }); } });

// Start server 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`);

