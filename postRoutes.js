const express = require('express');
const Post = require('./models/Post');
const authenticateUser = require('./authMiddleware');

const router = express.Router();

// Create a post with the logged-in user's username
router.post('/posts', authenticateUser, async (req, res) => {
  const { title, content, imageUrl, state, district } = req.body;
  const username = req.user.username;

  try {
    const post = await Post.create({
      title,
      content,
      imageUrl,
      state,
      district,
      username
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

module.exports = router;
