const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
