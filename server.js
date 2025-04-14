const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', true);
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// Schema with full location
const Post = mongoose.model('Post', new mongoose.Schema({
  title: String,
  content: String,
  imageUrl: String,
  state: String,
  district: String,
  taluk: String,
  username: String,
  profilePic: String,
  bio: String
}, { timestamps: true }));

// GET: Filter by state/district/taluk
app.get('/posts', async (req, res) => {
  try {
    const { state, district, taluk } = req.query;
    const query = {};
    if (state) query.state = state;
    if (district) query.district = district;
    if (taluk) query.taluk = taluk;
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// POST: Create post with location
app.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imageUrl: req.file ? req.file.path : null,
      state: req.body.state,
      district: req.body.district,
      taluk: req.body.taluk,
      username: req.body.username,
      profilepic: req.body.profilepic
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Get single post by ID
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving post' });
  }
});

app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('posts followers following');
    res.json(user);
  } catch (err) {
    console.log(err); // Debugging error
    res.status(500).json({ message: 'Error loading user profile' });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),  // Save to the "uploads" directory
  filename: (req, file, cb) => cb(null, Date.now() + file.originalname),  // Save with a unique name
});

const upload = multer({ storage });

app.put('/user/:id/edit', upload.single('profilePic'), async (req, res) => {
  try {
    const { username, bio } = req.body;
    const file = req.file;  // Handle file upload
    
    const updateData = { username, bio };
    if (file) {
      // Process the file (e.g., upload to Cloudinary if needed)
      const uploadedPicUrl = await uploadToCloudinary(file);
      updateData.profilePic = uploadedPicUrl;
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(user);
  } catch (err) {
    console.log(err); // Debugging error
    res.status(500).json({ message: 'Error updating profile' });
  }
});

app.post('/follow/:id', async (req, res) => {
  try {
    // Logic for following the user
    const user = await User.findById(req.params.id);
    // Add to following, add follower
    res.json({ message: 'Followed successfully' });
  } catch (err) {
    console.log(err); // Debugging error
    res.status(500).json({ message: 'Error following user' });
  }
});

app.post('/unfollow/:id', async (req, res) => {
  try {
    // Logic for unfollowing the user
    const user = await User.findById(req.params.id);
    // Remove from following, remove follower
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.log(err); // Debugging error
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});

const commentRoutes = require('./routes/comments');
app.use('/comments', commentRoutes);

const profileRoutes = require('./routes/profile');
app.use('/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
