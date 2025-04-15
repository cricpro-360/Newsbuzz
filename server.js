// Full working server.js with real user profile support
const express = require('express'); const mongoose = require('mongoose'); const bodyParser = require('body-parser'); const multer = require('multer'); const cors = require('cors'); require('dotenv').config();

const cloudinary = require('cloudinary').v2; const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ cloud_name: 'dods2fuur', api_key: '974131963864589', api_secret: 'f5HXawyekgvI2QSECiB7jSHwY2A' });

const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'newsbuzz', allowed_formats: ['jpg', 'png', 'jpeg'], transformation: [{ width: 800, height: 600, crop: 'limit' }] } });

const upload = multer({ storage });

const app = express(); const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', true); app.use(cors()); app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }) .then(() => console.log('MongoDB Connected')) .catch((err) => console.error('MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({ username: String, profilePic: String, bio: String, followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }] }); const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({ title: String, content: String, imageUrl: String, state: String, district: String, taluk: String, username: String, profilePic: String, userId: String, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], comments: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }] }, { timestamps: true }); const Post = mongoose.model('Post', postSchema);

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
      username: user.username, // ADD
      profilePic: user.profilePic, // ADD
      userId: user._id, // ADD
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

// Get posts with filtering 
app.get('/posts', async (req, res) => { try { const { state, district, taluk } = req.query; const query = {}; if (state) query.state = state; if (district) query.district = district; if (taluk) query.taluk = taluk; const posts = await Post.find(query).populate('user', 'username profilePic').sort({ createdAt: -1 }); res.json(posts); } catch (err) { res.status(500).json({ message: 'Failed to fetch posts' }); } });

// Get single post
app.get('/posts/:id', async (req, res) => { try { const post = await Post.findById(req.params.id).populate('user', 'username profilePic'); if (!post) return res.status(404).json({ message: 'Post not found' }); res.json(post); } catch (err) { res.status(500).json({ message: 'Error retrieving post' }); } });

// Get user profile by ID
app.get('/user/:id', async (req, res) => { try { const user = await User.findById(req.params.id).populate({ path: 'posts', populate: { path: 'user', select: 'username profilePic' } }).populate('followers').populate('following'); res.json(user); } catch (err) { res.status(500).json({ message: 'Error loading user profile' }); } });

// Edit profile
app.put('/user/:id/edit', upload.single('profilePic'), async (req, res) => { try { const { username, bio } = req.body; const updateData = { username, bio }; if (req.file) updateData.profilePic = req.file.path; const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }); res.json(user); } catch (err) { res.status(500).json({ message: 'Error updating profile' }); } });

// Follow user
app.post('/follow/:id', async (req, res) => { try { const followerId = req.body.followerId; const user = await User.findById(req.params.id); const follower = await User.findById(followerId);

if (!user.followers.includes(followerId)) user.followers.push(followerId);
if (!follower.following.includes(user._id)) follower.following.push(user._id);

await user.save();
await follower.save();

res.json({ message: 'Followed successfully' });

} catch (err) { res.status(500).json({ message: 'Error following user' }); } });

// Unfollow user
app.post('/unfollow/:id', async (req, res) => { try { const followerId = req.body.followerId; const user = await User.findById(req.params.id); const follower = await User.findById(followerId);

user.followers = user.followers.filter(id => id.toString() !== followerId);
follower.following = follower.following.filter(id => id.toString() !== req.params.id);

await user.save();
await follower.save();

res.json({ message: 'Unfollowed successfully' });

} catch (err) { res.status(500).json({ message: 'Error unfollowing user' }); } });

// Like a post
app.post('/posts/:id/like', async (req, res) => { try { const { userId } = req.body; const post = await Post.findById(req.params.id); if (!post.likes.includes(userId)) post.likes.push(userId); await post.save(); res.json({ message: 'Post liked' }); } catch (err) { res.status(500).json({ message: 'Error liking post' }); } });

// Unlike a post
app.post('/posts/:id/unlike', async (req, res) => { try { const { userId } = req.body; const post = await Post.findById(req.params.id); post.likes = post.likes.filter(id => id.toString() !== userId); await post.save(); res.json({ message: 'Post unliked' }); } catch (err) { res.status(500).json({ message: 'Error unliking post' }); } });

// Comment on a post
app.post('/posts/:id/comment', async (req, res) => { try { const { userId, text } = req.body; const post = await Post.findById(req.params.id); post.comments.push({ userId, text }); await post.save(); res.json({ message: 'Comment added' }); } catch (err) { res.status(500).json({ message: 'Error adding comment' }); } });

// Get comments
app.get('/posts/:id/comments', async (req, res) => { try { const post = await Post.findById(req.params.id).populate('comments.userId', 'username profilePic'); res.json(post.comments); } catch (err) { res.status(500).json({ message: 'Error fetching comments' }); } });

app.listen(PORT, () => console.log(Server running on port ${PORT}));

